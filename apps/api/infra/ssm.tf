resource "aws_ssm_parameter" "database_url" {
  name        = "/${var.app_name}/DATABASE_URL"
  description = "PostgreSQL connection string (Supabase)"
  type        = "SecureString"
  value       = var.database_url

  tags = local.common_tags
}

resource "aws_ssm_parameter" "openrouter_api_key" {
  name        = "/${var.app_name}/OPENROUTER_API_KEY"
  description = "OpenRouter API key"
  type        = "SecureString"
  value       = var.openrouter_api_key

  tags = local.common_tags
}
