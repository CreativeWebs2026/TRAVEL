$titles = @(
  "Hoh Rainforest","Matterhorn","Skogafoss","Bora Bora","Uluru","Milky Way","Campfire",
  "Tokyo","Senso-ji","Shibuya Crossing","Tokyo Tower","Meiji Shrine","Shinjuku Gyoen National Garden",
  "Rome","Colosseum","Trevi Fountain","Pantheon, Rome","Roman Forum","Piazza Navona",
  "Santorini","Oia, Greece","Fira","Akrotiri (prehistoric city)",
  "Geirangerfjord","Preikestolen","Trolltunga","Bergen","Flam Line",
  "Bali","Tegallalang","Uluwatu Temple","Tanah Lot","Ubud",
  "Banff National Park","Lake Louise (Alberta)","Moraine Lake","Johnston Canyon","Peyto Lake",
  "Paris","Eiffel Tower","Louvre","Notre-Dame de Paris","Montmartre","Arc de Triomphe",
  "Maldives","Male"
)

$results = @{}
foreach ($t in $titles) {
  $encoded = [uri]::EscapeDataString($t)
  try {
    $r = Invoke-RestMethod -Uri "https://en.wikipedia.org/api/rest_v1/page/summary/$encoded" -Headers @{ "User-Agent" = "TravelAI-prototype/1.0 (contact: arturcucummx@gmail.com)" } -ErrorAction Stop
    $results[$t] = [ordered]@{
      title = $r.title
      description = $r.description
      extract = $r.extract
      thumb = $r.thumbnail.source
      original = $r.originalimage.source
      lat = $r.coordinates.lat
      lon = $r.coordinates.lon
    }
    Write-Output "OK: $t -> $($r.originalimage.source)"
  } catch {
    Write-Output "FAIL: $t -> $($_.Exception.Message)"
  }
}

$results | ConvertTo-Json -Depth 5 | Out-File -FilePath "wiki-images.json" -Encoding utf8
Write-Output "Done. Saved wiki-images.json"
