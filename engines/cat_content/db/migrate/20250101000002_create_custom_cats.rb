class CreateCustomCats < ActiveRecord::Migration[8.1]
  def change
    # This migration will run in the cat_content schema due to search_path configuration
    create_table :custom_cats, id: :uuid do |t|
      t.string :user_id, null: false, index: true
      t.string :name, null: false
      t.text :prompt_text
      t.jsonb :quiz_results
      t.text :story_text
      t.string :visibility, default: "private", null: false
      t.string :image_url
      
      t.timestamps
    end
    
    add_index :custom_cats, :visibility
    add_index :custom_cats, [:user_id, :visibility]
  end
end

