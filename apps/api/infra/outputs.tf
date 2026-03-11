output "api_url" {
  description = "Public API Gateway URL"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "lambda_function_name" {
  description = "Lambda function name (used by deploy workflow)"
  value       = aws_lambda_function.api.function_name
}
