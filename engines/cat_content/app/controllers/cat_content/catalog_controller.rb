# frozen_string_literal: true

module CatContent
  class CatalogController < ActionController::API
    # GET /catalog
    # Returns paginated list of published cat listings
    def index
      page = params[:page]&.to_i || 1
      per_page = params[:per_page]&.to_i || 20
      per_page = [ per_page, 100 ].min # Cap at 100
      tags = parse_tags(params[:tags])

      # Use constantize to ensure autoloading works
      model_class = "CatContent::Infrastructure::Persistence::Models::CatListingRecord".constantize
      
      records = model_class
        .where(visibility: "public")
        .order(created_at: :desc)
        .offset((page - 1) * per_page)
        .limit(per_page)

      # Filter by tags if provided
      if tags.any?
        records = records.where("tags && ARRAY[?]::text[]", tags)
      end

      total = model_class
        .where(visibility: "public")
        .count

      cats = records.map do |record|
        {
          id: record.id,
          name: record.name,
          slug: record.slug,
          description: record.description,
          image_url: record.image_url,
          price: {
            amount_cents: record.price_cents,
            currency: record.currency
          },
          tags: record.tags || []
        }
      end

      render json: {
        cats: cats,
        meta: {
          page: page,
          per_page: per_page,
          total: total
        }
      }
    end

    # GET /catalog/:slug
    # Returns full details of a single cat by slug
    def show
      model_class = "CatContent::Infrastructure::Persistence::Models::CatListingRecord".constantize
      record = model_class.find_by(slug: params[:slug], visibility: "public")

      if record
        cat_data = {
          id: record.id,
          name: record.name,
          slug: record.slug,
          description: record.description,
          image_url: record.image_url,
          price: {
            amount_cents: record.price_cents,
            currency: record.currency
          },
          tags: record.tags || []
        }

        # Include profile if available
        if record.age_months || record.temperament || record.traits&.any?
          cat_data[:profile] = {
            age_months: record.age_months,
            temperament: record.temperament,
            traits: record.traits || []
          }
        end

        # Include media if available
        if record.image_url
          cat_data[:media] = [
            {
              url: record.image_url,
              alt_text: record.image_alt
            }
          ]
        end

        render json: cat_data
      else
        render json: {
          error: {
            code: "cat_not_found",
            message: "The requested cat does not exist",
            details: { slug: params[:slug] }
          }
        }, status: :not_found
      end
    end

    private

    def parse_tags(tags_param)
      return [] if tags_param.nil? || tags_param.empty?
      return tags_param if tags_param.is_a?(Array)
      tags_param.to_s.split(",").map(&:strip).reject(&:empty?)
    end
  end
end

