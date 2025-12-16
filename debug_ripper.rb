require 'ripper'
code = "Infrastructure::Wiring::Container.resolve(:custom_cat_repo)"
pp Ripper.sexp(code)

