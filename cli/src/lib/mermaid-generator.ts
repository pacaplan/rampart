import { Architecture } from "./architecture-parser.js";

export interface MermaidDiagram {
  filename: string;
  title: string;
  mermaidCode: string;
}

function sanitize(str: string): string {
  return str.replace(/"/g, "'").replace(/\n/g, "<br/>");
}

export function slugify(str: string): string {
  return str
    // Insert underscore before uppercase letters (handles PascalCase)
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function wrapText(text: string, maxLength: number = 30): string {
  const words = text.split(" ");
  let currentLine = "";
  const lines: string[] = [];

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  return lines.join("<br/>");
}

export function generateL1(arch: Architecture, bcId: string): MermaidDiagram {
  const lines: string[] = ["flowchart TB"];

  // Actors Subgraph
  if (arch.actors && arch.actors.length > 0) {
    lines.push("    subgraph Actors");
    for (const actor of arch.actors) {
      lines.push(`        ${actor.name.replace(/\s+/g, "")}[${actor.name}]`);
    }
    lines.push("    end");
  }

  // BC Node
  let bcLabel = arch.name;
  if (arch.description) {
    // Try to split description into bullets if it contains commas or is long
    const desc = wrapText(arch.description, 40);
    bcLabel += `<br/>─────<br/>${desc}`;
  }
  lines.push(`    BC["${sanitize(bcLabel)}"]`);

  // Actor Edges
  if (arch.actors) {
    for (const actor of arch.actors) {
      const actorId = actor.name.replace(/\s+/g, "");
      const label = actor.description ? wrapText(actor.description, 20) : "";
      lines.push(`    ${actorId} -->|"${sanitize(label)}"| BC`);
    }
  }

  // Downstream BCs
  const downstreamBcs = new Set<string>();
  if (arch.relationships?.publishes_to) {
    arch.relationships.publishes_to.forEach((r) => downstreamBcs.add(r.bc));
  }
  if (arch.relationships?.consumed_by) {
    arch.relationships.consumed_by.forEach((r) => downstreamBcs.add(r.bc));
  }

  if (downstreamBcs.size > 0) {
    lines.push("    subgraph Downstream[\"Neighboring BCs\"]");
    for (const bc of downstreamBcs) {
      const bcName = bc.charAt(0).toUpperCase() + bc.slice(1) + " BC";
      lines.push(`        ${bc}[${bcName}]`);
    }
    lines.push("    end");

    // Edges to Downstream
    if (arch.relationships?.publishes_to) {
      for (const rel of arch.relationships.publishes_to) {
        const events = rel.events.join("<br/>");
        lines.push(`    BC -->|"${sanitize(events)}"| ${rel.bc}`);
      }
    }
    if (arch.relationships?.consumed_by) {
      for (const rel of arch.relationships.consumed_by) {
        lines.push(`    BC -.->|"consumed by"| ${rel.bc}`);
      }
    }
  }

  // External Systems
  if (arch.external_systems && arch.external_systems.length > 0) {
    lines.push("    subgraph External[\"External Systems\"]");
    for (const sys of arch.external_systems) {
      const sysId = sys.name.replace(/[^a-zA-Z0-9]/g, "");
      let label = sys.name;
      if (sys.providers && sys.providers.length > 0) {
        label += `<br/>${sys.providers.join(", ")}`;
      }
      if (sys.type === "database") {
         lines.push(`        ${sysId}[("${sanitize(label)}")]`);
      } else {
         lines.push(`        ${sysId}[${sanitize(label)}]`);
      }
       lines.push(`    BC --> ${sysId}`);
    }
    lines.push("    end");
  }

  return {
    filename: `${bcId}_l1_context`,
    title: "System Context",
    mermaidCode: lines.join("\n"),
  };
}

export function generateL3(
  arch: Architecture,
  capability: NonNullable<Architecture["layers"]["application"]["capabilities"]>[0],
  bcId: string
): MermaidDiagram {
  const lines: string[] = ["flowchart TB"];
  const capSlug = slugify(capability.name);

  // Actors
  for (const actorName of capability.actors) {
      const actorId = actorName.replace(/\s+/g, "");
      lines.push(`    ${actorId}["${actorName}"]`);
  }

  // Controller / Entrypoints
  // Usually one main entrypoint starts the flow
  const entrypoint = capability.entrypoints[0];
  if (entrypoint) {
      const controllerId = "Controller";
      // Check if this is a Controller#action format or CLI/other format
      const isControllerAction = entrypoint.includes("#");
      const [controllerName, action] = isControllerAction ? entrypoint.split("#") : [entrypoint, null];

      // Edge from actor
      const actorId = capability.actors[0]?.replace(/\s+/g, "");
      if (actorId) {
          // Find route if possible (only for HTTP entrypoints)
          const routeInfo = arch.layers.infrastructure.entrypoints.http?.find(e => e.name === controllerName);
          let routeLabel = action || entrypoint; // Fallback to full entrypoint if no action
          if (routeInfo?.routes) {
              routeLabel = routeInfo.routes;
          }
          lines.push(`    ${actorId} -->|"${sanitize(routeLabel)}"| ${controllerId}`);
      }

      lines.push(`    ${controllerId}["${sanitize(entrypoint)}"]`);

      // Service
      if (capability.orchestrates && capability.orchestrates.length > 0) {
          const serviceName = capability.orchestrates[0];
          const serviceId = "Service";
          lines.push(`    ${controllerId} -->|invokes| ${serviceId}`);
          lines.push(`    ${serviceId}["${serviceName}"]`);

          // Ports & Adapters
          if (capability.uses_ports) {
              capability.uses_ports.forEach((portName, idx) => {
                  const portId = `Port${idx}`;
                  lines.push(`    ${serviceId} -->|uses port| ${portId}["${portName}<br/>(port)"]`);
                  
                  // Find Adapter
                  const adapter = arch.layers.infrastructure.adapters.persistence.find(a => a.implements === portName) ||
                                  arch.layers.infrastructure.adapters.external.find(a => a.implements === portName);
                  
                  if (adapter) {
                      const adapterId = `Adapter${idx}`;
                      lines.push(`    ${portId} -.->|impl| ${adapterId}["${adapter.name}"]`);
                      
                      // External System connection?
                      // If adapter is persistence, link to DB
                      if (arch.layers.infrastructure.adapters.persistence.some(a => a.name === adapter.name)) {
                          const dbSys = arch.external_systems?.find(s => s.description?.toLowerCase().includes("persistence") || s.name.toLowerCase().includes("postgres") || s.name.toLowerCase().includes("db"));
                          if (dbSys) {
                              const dbId = dbSys.name.replace(/[^a-zA-Z0-9]/g, "");
                               lines.push(`    ${adapterId} --> ${dbId}[("${sanitize(dbSys.name)}")]`);
                          } else {
                               // Generic DB
                               lines.push(`    ${adapterId} --> DB[("(Database)")]`);
                          }
                      } 
                      // If external adapter, try to find matching external system
                      else {
                           const extSys = arch.external_systems?.find(s => 
                              (adapter.technology && s.name.includes(adapter.technology)) ||
                              (s.providers && s.providers.some(p => adapter.name.includes(p)))
                           );
                           if (extSys) {
                               const extId = extSys.name.replace(/[^a-zA-Z0-9]/g, "");
                               lines.push(`    ${adapterId} --> ${extId}["${sanitize(extSys.name)}"]`);
                           }
                      }
                  }
              });
          }

          // Aggregate
          // Find which aggregate this service orchestrates
          const serviceDef = arch.layers.application.services.find(s => s.name === serviceName);
          if (serviceDef) {
              const aggregateName = serviceDef.orchestrates;
              const aggregateDef = arch.layers.domain.aggregates.find(a => a.name === aggregateName);
              
              if (aggregateDef) {
                  const aggId = "Aggregate";
                  const aggLabel = `${aggregateName} Aggregate`;
                  lines.push(`    ${serviceId} -->|orchestrates| ${aggId}["${sanitize(aggLabel)}"]`);

                  // Events
                  if (capability.emits && capability.emits.length > 0) {
                      capability.emits.forEach((eventName, idx) => {
                          const eventDef = arch.layers.domain.events.find(e => e.name === eventName);
                          const eventId = `Event${idx}`;
                          let eventLabel = eventName;
                          if (eventDef?.payload_intent) {
                              eventLabel += `<br/>─────<br/>${eventDef.payload_intent.join("<br/>")}`;
                          }
                          lines.push(`    ${aggId} -->|emits| ${eventId}["${sanitize(eventLabel)}"]`);
                          
                          // Event Bus
                          lines.push(`    ${eventId} --> EventBus[Event Bus]`);
                      });
                  }
              }
          }
      }
  }

  return {
    filename: `${bcId}_l3_${capSlug}`,
    title: capability.name,
    mermaidCode: lines.join("\n"),
  };
}

export function generateAllDiagrams(arch: Architecture, bcId: string): MermaidDiagram[] {
  const diagrams: MermaidDiagram[] = [];
  
  // L1
  diagrams.push(generateL1(arch, bcId));
  
  // L3s
  if (arch.layers.application.capabilities) {
    for (const cap of arch.layers.application.capabilities) {
      diagrams.push(generateL3(arch, cap, bcId));
    }
  }
  
  return diagrams;
}

