# span-vscode

The `span-vscode`-extension is a simple extension to easier get started with the development towards the [IoT platform Span](https://span.lab5e.com).

## Features

- Listing your available `collections` and `devices`
- Copyable IMSI/IMEI from devices
- Tailing device data stream

## Configuration

To communicate with [Span](https://span.lab5e.com), you need an API key. To generate one go to the [API token overview](https://span.lab5e.com/api-tokens-overview) and create a token with at least read capabilities to all resources. You must then add a `.span`-file which contains the token.

The format for the file is

```bash
TOKEN:YOUR_API_KEY
```

### Run generate command

To simplify getting started, you can run the `Span: Initiate a Span API key file`, and choose either global or workspace scope for your token.

## Extension Settings

- `span-vscode.APIKeyPath`: Custom API key path which the extension will look for a `.span`-file with token.
