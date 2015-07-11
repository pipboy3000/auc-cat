require 'bundler'
Bundler.require
require 'open-uri'
require 'json'

# TODO: Aucモジュールに入れる

class Cat < Sinatra::Application
  configure do
    set :csv_url, "http://batchsubmit.auctions.yahoo.co.jp/html/category.csv"
    set :csv_store, File.join(File.dirname(__FILE__), "cache", "category.csv")
    set :json_store, File.join(File.dirname(__FILE__), "cache", "category.json")
  end

  configure :development do
    Bundler.require :development
    register Sinatra::Reloader
  end
  
  def download
    open(settings.csv_store, 'w') do |store|
      open(settings.csv_url, 'r') {|csv| store.write(csv.read) }
    end
    p "download from server"
    open(settings.csv_store, 'r:shift_jis:utf-8')
  end

  def store(json)
    open(settings.json_store, 'w') do |store|
      store.write(json)
    end
    open(settings.json_store, 'r')
  end

  def convert(arr)
    data = arr.readlines.map do |row|
      id, title = row.split(',')
      {id: id.to_i, title: title}
    end
    data.shift
    data
  end

  def csvCache
    p "use cache"
    open(settings.csv_store, 'r:shift_jis:utf-8')
  end

  def jsonCache
    open(settings.json_store, 'r')
  end

  def fresh?
    return false unless File.exist?(settings.csv_store)
    now = Time.now
    now - File.mtime(settings.csv_store) < 60*60*24*3
  end

  def exist?
    return File.exist?(settings.json_store)
  end

  before do
    @csv = fresh? ? csvCache : download
    @data = convert(@csv)
    @json = exist? ? jsonCache : store(@data.to_json)
  end

  get '/' do
    content_type :json
    @json.read
  end

  get '/search/keyword/:keyword?' do
    halt 404, 'No keyword given' if params[:keyword].nil?

    results = @data.select do |item|
      item[:title].include? params[:keyword]
    end

    halt 404 if results.nil?

    response['Access-Control-Allow-Origin'] = "*"
    content_type :json
    results.to_json
  end

  get '/search/id/:id?' do
    halt 404, 'No id given' if params[:id].nil?

    results = @data.find do |item|
      item[:id].to_s == params[:id]
    end
    
    halt 404 if results.nil?

    content_type :json
    results.to_json
  end

  get '/refresh' do
    download
    status 204
  end
end
