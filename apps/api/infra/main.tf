terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  backend "s3" {
    bucket         = "zeladoria-inteligente-tfstate"
    key            = "api/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "zeladoria-inteligente-tflock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  common_tags = {
    Project     = var.app_name
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
