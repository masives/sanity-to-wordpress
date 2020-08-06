# What is this script?

The script goal is to make migrating from Wordpress to Sanity easier. It allows you to generate `.ndjson` file ready to be imported into your Sanity database.

Schemas are in line with default Sanity gatsby starter, which you can create on https://www.sanity.io/create?template=sanity-io%2Fsanity-template-gatsby-blog

It handles few edge cases:

- the script will warn you on images being downloaded from google cdn (which cannot be imported using sanity-cli)
- it handles more than 100 entries per type
- it allows blocklisting broken/non-existing images
- it chunks the resulting bundle into 50 documents size files

# How to run it

1. Clone the repo

   ```
   git clone git@github.com:10clouds/wordpress-sanity-migration-tool.git
   ```

2. Generate bundle for migration
   ```
   node index --url https://wordpress-site-url
   ```
3. Import each chunk to Sanity

   This script must be ran from your Sanity folder ie. the one containing sanity.json!

   ```
   sanity dataset import PATH-TO-FILE DATABASE-NAME
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

# How to use blocklist

If the media asset is not available at the source Wordpress site than the sanity-cli will throw error during the import. It will looks similar to the one below.

You can see that the asset "https://10clouds.com/wp-content/uploads/2019/05/programisci-1024x683.jpg" is not available. If that's the case you can add it to blocklist array at [missingImagesBlockList.js](missingImagesBlockList.js) to and rerun script to ignore this asset.

```
➜  studio git:(master) ✗ sanity dataset import ../../sanity-to-wordpress-miration-tool/wordpress-data-2.ndjson production --replace
✔ [100%] Fetching available datasets
✔ [100%] Reading/validating data file (424ms)
✔ [100%] Importing documents (1.42s)
✖ [ 98%] Importing assets (files/images) (39.53s)
Error: Error while fetching asset from "https://10clouds.com/wp-content/uploads/2019/05/programisci-1024x683.jpg":
File does not exist at the specified endpoint
    at getUri (~/workspace/sanity-gatsby-blog/studio/node_modules/@sanity/import/lib/util/getHashedBufferForUri.js:44:14)
    at ClientRequest.onresponse (~/workspace/sanity-gatsby-blog/studio/node_modules/get-uri/http.js:152:14)

```

# How the script works

1. Download Wordpress media (images,thumbnails) as we will need to download them to new CMS.
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

- script doesn't check if the file provide in Wordpress exists which will break Sanity import! You have to add the url to [missingImagesBlocklist.js](missingImagesBlocklist.js)
- images are exported as enhancedImage which includes alt and caption
- you can see the reference to schema used in [schemas](./schemas) directory
- errors are input into `resources.errors.log` file

# Acknowledgments

When creating this solution I've leaned heavily on [wordpress-to-sanity repository](https://github.com/kmelve/wordpress-to-sanity).
