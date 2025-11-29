# frozen_string_literal: true

module CatContent
  module Infrastructure
    module Persistence
      module Repositories
        class SqlCatListingRepository < Ports::CatListingRepository
          def initialize(mapper: Mappers::CatListingMapper.new)
            @mapper = mapper
          end

          def add(aggregate)
            rec = @mapper.to_record(aggregate)
            rec.save!
            aggregate
          end

          def find(id)
            rec = Models::CatListingRecord.find_by(id: id.to_s)
            rec && @mapper.to_domain(rec)
          end

          def find_by_slug(slug)
            rec = Models::CatListingRecord.find_by(slug: slug.to_s, visibility: "public")
            rec && @mapper.to_domain(rec)
          end

          def list_public(tags: [], page: 1, per_page: 20)
            scope = Models::CatListingRecord.where(visibility: "public")
            scope = scope.where("tags && ARRAY[?]::text[]", tags) if tags.any?
            total = scope.count
            cats = scope.order(created_at: :desc)
                        .offset((page - 1) * per_page)
                        .limit(per_page)
                        .map { |r| @mapper.to_domain(r) }
            { cats: cats, meta: { page: page, per_page: per_page, total: total } }
          end

          def update(aggregate)
            add(aggregate) # find_or_initialize handles upsert
          end

          def remove(id)
            Models::CatListingRecord.where(id: id.to_s).delete_all
          end
        end
      end
    end
  end
end

