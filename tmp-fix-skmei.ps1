$ErrorActionPreference='Stop'
function Fix-Twice([string]$s) {
  if ([string]::IsNullOrEmpty($s)) { return $s }
  $enc1251 = [Text.Encoding]::GetEncoding('windows-1251')
  $s1 = [Text.Encoding]::UTF8.GetString($enc1251.GetBytes($s))
  $s2 = [Text.Encoding]::UTF8.GetString($enc1251.GetBytes($s1))
  return $s2
}
function Extract-Code([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) { return $null }
  if ($value -match '(?i)skmei\s+([A-Z0-9-]+)') { return $matches[1].ToUpper() }
  if ($value -match '(?i)(BOXMA\d+)') { return $matches[1].ToUpper() }
  return $null
}
$unavailableCodes = [System.Collections.Generic.HashSet[string]]::new()
Get-ChildItem 'E:\ChatGPT\Price\skmei-page-*.html' | Sort-Object Name | ForEach-Object {
  $raw = Get-Content $_.FullName -Raw
  $blocks = [regex]::Matches($raw, '<li\b[^>]*data-qaid="product-block"[\s\S]*?</li>')
  foreach ($m in $blocks) {
    $block = $m.Value
    if ($block -match 'b-product-gallery__state_val_clarify') {
      $codeMatch = [regex]::Match($block, '(?i)Skmei\s+([A-Z0-9-]+)')
      if ($codeMatch.Success) { [void]$unavailableCodes.Add($codeMatch.Groups[1].Value.ToUpper()) }
    }
  }
}
$rawJs = Get-Content 'E:\ChatGPT\Price\skmei-data.js' -Raw
if ($rawJs -notmatch 'const\s+skmeiProducts\s*=\s*(\[.*\]);?\s*$') { throw 'Could not parse skmei-data.js' }
$json = $matches[1]
$products = $json | ConvertFrom-Json
foreach ($p in $products) {
  $p.name = Fix-Twice ([string]$p.name)
  $p.category = Fix-Twice ([string]$p.category)
  $p.drop = Fix-Twice ([string]$p.drop)
  $code = Extract-Code ([string]$p.name)
  if ($code -and $unavailableCodes.Contains($code)) {
    $p.availability = 'Немає в наявності'
  } else {
    $p.availability = 'В наявності'
  }
}
$outJson = $products | ConvertTo-Json -Compress -Depth 5
$out = 'const skmeiProducts = ' + $outJson + ';'
[System.IO.File]::WriteAllText('E:\ChatGPT\Price\skmei-data.js', $out, [System.Text.UTF8Encoding]::new($false))
$html = Get-Content 'E:\ChatGPT\Price\skmei-demo.html' -Raw
$html = $html -replace 'skmei-data\.js\?v=\d+', 'skmei-data.js?v=47'
[System.IO.File]::WriteAllText('E:\ChatGPT\Price\skmei-demo.html', $html, [System.Text.UTF8Encoding]::new($false))
Write-Host ('Unavailable explicit codes: ' + $unavailableCodes.Count)
Write-Host ('Products total: ' + $products.Count)
Write-Host ('Now unavailable: ' + (($products | Where-Object availability -eq 'Немає в наявності').Count))
Write-Host ('Now available: ' + (($products | Where-Object availability -eq 'В наявності').Count))
