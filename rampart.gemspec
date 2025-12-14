require_relative "lib/rampart/version"

Gem::Specification.new do |spec|
  spec.name = "rampart"
  spec.version = Rampart::VERSION
  spec.authors = ["Rampart Team"]
  spec.email = ["team@rampart.dev"]

  spec.summary = "Architecture on Rails"
  spec.description = "A pure-Ruby framework for building DDD applications with Hexagonal Architecture"
  spec.homepage = "https://github.com/pacaplan/rampart"
  spec.license = "Apache-2.0"
  spec.required_ruby_version = ">= 3.3.0"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/pacaplan/rampart"

  spec.files = Dir["lib/**/*", "LICENSE", "README.md"]
  spec.require_paths = ["lib"]

  spec.add_dependency "dry-types", "~> 1.7"
  spec.add_dependency "dry-struct", "~> 1.6"
  spec.add_dependency "dry-container", "~> 0.11"
  spec.add_dependency "dry-auto_inject", "~> 1.0"
  spec.add_dependency "dry-monads", "~> 1.6"
  spec.add_dependency "dry-initializer", "~> 3.1"
end
