# {{BC_NAME}} — Architecture Diagrams

Generated from `{{JSON_PATH}}` on {{TIMESTAMP}}

---

## L1: System Context

![L1 System Context](images/{{BC_ID}}_l1_context.{{FORMAT}})

---

## L3: Capability Flows

{{#each capabilities}}
### {{name}}

![{{name}}](images/{{BC_ID}}_l3_{{slug}}.{{FORMAT}})

{{/each}}

