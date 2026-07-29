<#
    Builds the self-contained DIPLO site page.

    diplo-mock-a.template.html holds @@TOKEN@@ placeholders; this script replaces
    them with base64-encoded fonts and images from ./assets and writes a single
    standalone .html that opens in any browser with no server and no network.

    Usage:
        powershell -File build.ps1

    Note the ErrorActionPreference below: a missing asset must abort the build.
    Without it PowerShell treats the failed file read as non-fatal and happily
    writes a "successful" page with empty images - which has already destroyed
    a good build once.

    Keep this file ASCII-only. Windows PowerShell 5.1 reads .ps1 as ANSI, so a
    stray em dash or smart quote becomes mojibake and the script stops parsing.
#>

$ErrorActionPreference = 'Stop'

$root   = $PSScriptRoot
$assets = Join-Path $root 'assets'

$tokens = @{
    'SC600'   = 'font-SairaCondensed-600.woff2'
    'SC700'   = 'font-SairaCondensed-700.woff2'
    'PLEX'    = 'font-IBMPlexSans-400.woff2'
    'MONO'    = 'font-IBMPlexMono-500.woff2'
    'MARK'    = 'mark.jpg'
    'STACKED' = 'stacked.jpg'
    'HERO'    = 'hero-dark.jpg'
}

function Convert-ToBase64 {
    param([string]$Path)
    if (-not (Test-Path $Path)) { throw "Missing build asset: $Path" }
    return [Convert]::ToBase64String([IO.File]::ReadAllBytes($Path))
}

$template = Join-Path $root 'diplo-mock-a.template.html'
$output   = Join-Path $root 'diplo-mock-a.html'

$html = [IO.File]::ReadAllText($template)

foreach ($token in $tokens.Keys) {
    $html = $html.Replace("@@$token@@", (Convert-ToBase64 (Join-Path $assets $tokens[$token])))
}

if ($html -match '@@[A-Z0-9]+@@') {
    throw "Unreplaced token still present - check the template against the asset list above."
}

$page = "<!doctype html>`n<html lang=`"en`">`n<meta charset=`"utf-8`">`n" + $html + "`n</html>"
[IO.File]::WriteAllText($output, $page, (New-Object System.Text.UTF8Encoding($false)))

$kb = [math]::Round((Get-Item $output).Length / 1KB)
Write-Output "built diplo-mock-a.html ($kb KB)"
