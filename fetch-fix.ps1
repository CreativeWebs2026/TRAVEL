function Get-CommonsPhoto($query) {
  $encoded = [uri]::EscapeDataString($query)
  $url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=$encoded&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1920&format=json"
  $r = Invoke-RestMethod -Uri $url -Headers @{ "User-Agent" = "TravelAI-prototype/1.0 (contact: arturcucummx@gmail.com)" }
  if (-not $r.query.pages) { return $null }
  $pages = $r.query.pages.PSObject.Properties.Value
  foreach ($p in $pages) {
    $ii = $p.imageinfo[0]
    if ($ii.mime -eq "image/jpeg" -and $ii.width -ge 900) {
      return [ordered]@{ title = $p.title; url = $ii.thumburl; original = $ii.url; width = $ii.width; height = $ii.height }
    }
  }
  return $null
}

$queries = @{
  "Eiffel Tower Fixed" = "Tour Eiffel Paris photo"
  "Maldives Fixed" = "Maldives resort island aerial lagoon"
  "Bora Bora Fixed" = "Bora Bora Mount Otemanu lagoon"
  "Campfire Fixed" = "bonfire night sparks"
}

$out = @{}
foreach ($k in $queries.Keys) {
  $res = Get-CommonsPhoto $queries[$k]
  if ($res) {
    $out[$k] = $res
    Write-Output "OK: $k -> $($res.url)"
  } else {
    Write-Output "MISS: $k"
  }
}
$out | ConvertTo-Json -Depth 5 | Out-File -FilePath "wiki-fix.json" -Encoding utf8
