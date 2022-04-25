# Mongo DB

## Atlas Search

Mongo DB Atlas search provides a powerful tool to enable autocomplete and search capabilities for users.
The following are the search indexes used to search for content in the app.

### Podcasts and Episodes

| Field      | Index name                  |
| ---------- | --------------------------- |
| `podcasts` | `PODCAST_TITLE_DESCRIPTION` |
| `episodes` | `EPISODE_TITLE_DESCRIPTION` |

```json
{
    "mappings": {
        "dynamic": false,
        "fields": {
            "description": {
                "type": "string"
            },
            "title": [
                {
                    "analyzer": "lucene.standard",
                    "foldDiacritics": true,
                    "maxGrams": 20,
                    "minGrams": 4,
                    "tokenization": "nGram",
                    "type": "autocomplete"
                },
                {
                    "type": "string"
                }
            ]
        }
    }
}
```

### Entities

| Field      | Index name         |
| ---------- | ------------------ |
| `entities` | `ENTITY_NAME_TYPE` |

```json
{
    "mappings": {
        "dynamic": false,
        "fields": {
            "name": [
                {
                    "foldDiacritics": true,
                    "maxGrams": 15,
                    "minGrams": 2,
                    "tokenization": "nGram",
                    "type": "autocomplete"
                },
                {
                    "type": "string"
                }
            ],
            "type": [
                {
                    "foldDiacritics": true,
                    "maxGrams": 15,
                    "minGrams": 2,
                    "tokenization": "nGram",
                    "type": "autocomplete"
                },
                {
                    "type": "string"
                }
            ]
        }
    }
}
```
