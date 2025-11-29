CatContent::Engine.routes.draw do
  get "health", to: "health#show"
  
  # Public catalog endpoints
  get "catalog", to: "catalog#index"
  get "catalog/:slug", to: "catalog#show"
end
