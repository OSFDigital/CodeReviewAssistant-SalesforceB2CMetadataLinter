# Code Review Assistant - Salesforce B2C Metadata Linter


```yaml
    - name: SalesforceB2CMetadataLinter
      uses: OSFGlobal/CodeReviewAssistant-SalesforceB2CMetadataLinter@master
      with:
          xsdsPath: xsds
          xmlsPath: metadata
          azureAccount: ${{ secrets.AZURE_ACCOUNT }}
          azureKey: ${{ secrets.AZURE_KEY }}
```
