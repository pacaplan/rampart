# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.
#
# Configuration:
# - All environments: Reads from FRONTEND_URL environment variable
#   Example: FRONTEND_URL=https://app.example.com
#   Multiple origins: FRONTEND_URL=https://app.example.com,https://www.example.com
# - Development: Can be set in .env.development file
# - Production: Must be set as environment variable
#
# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # CORS origins from FRONTEND_URL environment variable
    # Supports multiple origins (comma-separated) or single origin
    origin_env = ENV["FRONTEND_URL"]
    
    origins(
      if origin_env.nil? || origin_env.empty?
        raise "CORS: FRONTEND_URL environment variable must be set in production"
      else
        # Parse comma-separated origins or use single origin
        origins_list = origin_env.split(",").map(&:strip).reject(&:empty?)
        origins_list.length == 1 ? origins_list.first : origins_list
      end
    )

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
