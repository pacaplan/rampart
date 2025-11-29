namespace :db do
  namespace :cat_content do
    desc "Create the cat_content schema in Supabase"
    task create: :environment do
      ActiveRecord::Base.connection.execute("CREATE SCHEMA IF NOT EXISTS cat_content")
      puts "✅ Created cat_content schema"
    end
    
    desc "Run migrations for cat_content schema"
    task migrate: :environment do
      # Set the search_path to cat_content before running migrations
      ActiveRecord::Base.establish_connection(:cat_content)
      
      # Run migrations from the cat_content engine
      migrations_path = Rails.root.join("../../engines/cat_content/db/migrate")
      ActiveRecord::MigrationContext.new(migrations_path, ActiveRecord::SchemaMigration).migrate
      
      puts "✅ Migrated cat_content schema"
    end
    
    desc "Rollback migrations for cat_content schema"
    task rollback: :environment do
      ActiveRecord::Base.establish_connection(:cat_content)
      
      migrations_path = Rails.root.join("../../engines/cat_content/db/migrate")
      ActiveRecord::MigrationContext.new(migrations_path, ActiveRecord::SchemaMigration).rollback
      
      puts "✅ Rolled back cat_content schema"
    end
  end
  
  namespace :setup do
    desc "Set up all database schemas"
    task all: :environment do
      Rake::Task["db:create"].invoke rescue nil
      Rake::Task["db:cat_content:create"].invoke
      Rake::Task["db:migrate"].invoke
      Rake::Task["db:cat_content:migrate"].invoke
      
      puts "\n✅ All schemas set up successfully!"
    end
  end
  
  namespace :test do
    desc "Test schema isolation"
    task isolation: :environment do
      puts "\n🔍 Testing schema isolation...\n"
      
      # Test 1: Primary database should only see public schema
      puts "\n1️⃣ Testing primary database (public schema)..."
      ActiveRecord::Base.establish_connection(:primary)
      primary_tables = ActiveRecord::Base.connection.tables
      puts "   Public schema tables: #{primary_tables.inspect}"
      
      if primary_tables.include?("cat_listings") || primary_tables.include?("custom_cats")
        puts "   ❌ FAILED: Primary database can see cat_content tables!"
      else
        puts "   ✅ PASSED: Primary database isolated from cat_content"
      end
      
      # Test 2: Cat_content database should only see cat_content schema
      puts "\n2️⃣ Testing cat_content database (cat_content schema)..."
      ActiveRecord::Base.establish_connection(:cat_content)
      cat_content_tables = ActiveRecord::Base.connection.tables
      puts "   Cat_content schema tables: #{cat_content_tables.inspect}"
      
      if cat_content_tables.include?("cat_listings") && cat_content_tables.include?("custom_cats")
        puts "   ✅ PASSED: Cat_content database can see its tables"
      else
        puts "   ❌ FAILED: Cat_content database cannot see its tables!"
      end
      
      # Test 3: Verify search_path is set correctly
      puts "\n3️⃣ Testing search_path configuration..."
      primary_path = ActiveRecord::Base.establish_connection(:primary)
      primary_search_path = ActiveRecord::Base.connection.select_value("SHOW search_path")
      puts "   Primary search_path: #{primary_search_path}"
      
      ActiveRecord::Base.establish_connection(:cat_content)
      cat_content_search_path = ActiveRecord::Base.connection.select_value("SHOW search_path")
      puts "   Cat_content search_path: #{cat_content_search_path}"
      
      if cat_content_search_path.include?("cat_content")
        puts "   ✅ PASSED: Cat_content search_path correctly configured"
      else
        puts "   ❌ FAILED: Cat_content search_path not configured!"
      end
      
      puts "\n✅ Schema isolation test complete!\n"
    end
  end
end

