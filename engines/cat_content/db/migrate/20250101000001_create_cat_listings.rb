class CreateCatListings < ActiveRecord::Migration[8.1]
  def change
    # This migration will run in the cat_content schema due to search_path configuration
    create_table :cat_listings, id: :uuid do |t|
      t.string :name, null: false
      t.text :description
      t.string :slug, null: false, index: { unique: true }
      t.integer :price_cents, null: false
      t.string :currency, default: "USD", null: false
      t.string :visibility, default: "private", null: false
      t.string :image_url
      t.string :image_alt
      t.jsonb :tags, default: []
      
      # Profile fields
      t.integer :age_months
      t.jsonb :traits, default: []
      t.string :temperament
      
      t.timestamps
    end
    
    add_index :cat_listings, :visibility
    add_index :cat_listings, :tags, using: :gin
  end
end

