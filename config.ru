require './app/cat'

# run Rack::URLMap.new("/api/cat" => Cat.new)

run Cat
