CatContent::Engine.routes.draw do
  # All controllers live in app/infrastructure/cat_content/http/controllers/
  get "health", to: "infrastructure/http/controllers/health#show"

  # Public catalog endpoints
  get "catalog", to: "infrastructure/http/controllers/catalog#index"
  get "catalog/:slug", to: "infrastructure/http/controllers/catalog#show"
end
