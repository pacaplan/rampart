CatContent::Engine.routes.draw do
  # Controllers follow hexagonal architecture and live in infrastructure layer
  # Route format: "module/submodule/controller#action" maps to CatContent::Module::Submodule::Controller
  get "health", to: "infrastructure/http/controllers/health#show"

  # Public catalog endpoints
  get "catalog", to: "infrastructure/http/controllers/catalog#index"
  get "catalog/:slug", to: "infrastructure/http/controllers/catalog#show"
end
