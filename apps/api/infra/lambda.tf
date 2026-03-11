# --- Placeholder zip (used only on first apply; ignored on subsequent deploys) ---
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = "exports.handler = async () => ({ statusCode: 200, body: 'deploying...' });"
    filename = "index.js"
  }
}

# --- IAM execution role ---
resource "aws_iam_role" "lambda_execution" {
  name = "${var.app_name}-lambda-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# --- Lambda function ---
resource "aws_lambda_function" "api" {
  function_name = var.app_name
  role          = aws_iam_role.lambda_execution.arn
  runtime       = "nodejs22.x"
  handler       = "dist/lambda.handler"
  timeout       = 30
  memory_size   = 512

  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  environment {
    variables = {
      NODE_ENV           = "production"
      CORS_ORIGIN        = var.cors_origin
      DATABASE_URL       = aws_ssm_parameter.database_url.value
      OPENROUTER_API_KEY = aws_ssm_parameter.openrouter_api_key.value
    }
  }

  lifecycle {
    # Code updates are handled by the deploy GitHub Actions workflow
    ignore_changes = [filename, source_code_hash]
  }

  tags = local.common_tags
}
