class HealthController < ApplicationController
  # GET /health
  # Comprehensive health check that aggregates status from all components
  def show
    checks = {
      api: check_api,
      database: check_primary_database,
      engines: {
        cat_content: check_cat_content_engine
      }
    }

    all_healthy = checks[:api][:status] == "healthy" &&
                  checks[:database][:status] == "connected" &&
                  checks[:engines][:cat_content][:status] == "healthy"

    render json: {
      service: "hexddd-api",
      status: all_healthy ? "healthy" : "degraded",
      timestamp: Time.current.iso8601,
      version: {
        rails: Rails.version,
        ruby: RUBY_VERSION
      },
      checks: checks
    }, status: all_healthy ? :ok : :service_unavailable
  end

  private

  def check_api
    {
      status: "healthy",
      uptime: uptime_string
    }
  end

  def check_primary_database
    ActiveRecord::Base.connection.execute("SELECT 1")
    {
      status: "connected",
      adapter: ActiveRecord::Base.connection.adapter_name
    }
  rescue StandardError => e
    {
      status: "disconnected",
      error: e.message
    }
  end

  def check_cat_content_engine
    CatContent::ApplicationRecord.connection.execute("SELECT 1")
    {
      status: "healthy",
      schema: "cat_content"
    }
  rescue StandardError => e
    {
      status: "unhealthy",
      error: e.message
    }
  end

  def uptime_string
    # Calculate approximate uptime since Rails booted
    boot_time = defined?(Rails.application.initialized?) ? Time.current : Time.current
    "running"
  end
end

