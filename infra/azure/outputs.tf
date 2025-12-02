output "azure_storage_connection_string" {
  value     = azurerm_storage_account.sa.primary_connection_string
  sensitive = true
}

output "azure_storage_account_name" {
  value = azurerm_storage_account.sa.name
}

output "azure_container_name" {
  value = azurerm_storage_container.main.name
}
