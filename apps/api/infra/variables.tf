variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name used as prefix for all resources"
  type        = string
  default     = "zeladoria-inteligente-api"
}

variable "database_url" {
  description = "PostgreSQL connection string (Supabase)"
  type        = string
  sensitive   = true
}

variable "openrouter_api_key" {
  description = "OpenRouter API key"
  type        = string
  sensitive   = true
}

variable "cors_origin" {
  description = "Allowed CORS origin for the API"
  type        = string
}
