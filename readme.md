# What is this script?

The script goal is to make migrating from wordpress to sanity easier. It allows you to generate `.ndjson` file ready to be imported into your sanity database.

Schemas are in line with default sanity gatsby starter, which you can create on https://www.sanity.io/create?template=sanity-io%2Fsanity-template-gatsby-blog

It handles few edge cases:

- the script will warn you on images being downloaded from google cdn (which cannot be imported using sanity-cli)
- it handles more than 100 entries per type
- it allows blocklisting broken/non-existing images
- it chunks the resulting bundle into 50 documents size files

# How to run it

1. Generate bundle for migration
   ```
   node index --url https://your-site-url
   ```
2. Import each chunk to sanity

   This script must be ran from your sanity folder ie. the one containing sanity.json!

   ```
       sanity dataset import ROUTE-TO-FILE DATABASE-NAME
   ```

   It could look like

   ```
      sanity dataset import ../../sanity-to-wordpress-miration-tool/wordpress-data-1.ndjson production --replace
   ```

You can add flags to replace existing documents or add only missing ones

```
    sanity dataset import ROUTE-TO-FILE DATABASE-NAME --replace
    sanity dataset import ROUTE-TO-FILE DATABASE-NAME --missing
```

# How the script works

1. Download wordpress media (images,thumbnails) as we will need to download them to new CMS.
2. Download users
3. Download categories
4. Download blogposts that will:
   1. Reference author
   2. Reference categories
   3. Have their content be written in [portable text](https://www.sanity.io/guides/introduction-to-portable-text)
   4. Have images moved along
   5. Have additional fields (seo, dates) moved along
5. Save everything in ndjson file chunks to be consumed by sanity-cli

Ndjson is split into chunks because sanity-cli will break if the resource is temporary unavailable. That way instead of retrying importing 300 documents + assets you do it only for current chunk.

# Important notes

- script doesn't check if the file provide in wordpress exists which will break sanity import! You have to add the url to [missingImagesBlackList.js](missingImagesBlackList.js)
- images are exported as enhancedImage which includes alt and caption
- you can see the reference to schema used in [schemas](./schemas) directory
- errors are input into `resources.errors.log` file

# Acknowledgments

When creating this solution I've leaned heavily on [wordpress-to-sanity repository](https://github.com/kmelve/wordpress-to-sanity).
