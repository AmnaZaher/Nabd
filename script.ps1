 = Get-Content -Raw swagger_latest.json | ConvertFrom-Json; .paths.'/api/Clinics'.post.requestBody | ConvertTo-Json -Depth 10 > clinics_post.json
