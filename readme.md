# What is this script?

The script goal is to make migrating from wordpress to sanity easier. It allows you to generate `.ndjson` file ready to be imported into your sanity database.

Since some opinions are made on how to shape authors, image and categories please check the [schemas](./schemas) directory. If you want to adjust the shape of resulting objects you can modify map functions in [resources.js](lib/resources.js).

The script downloads posts, authors and categories from wordpress api, maps them to objects in line with schemas in [schemas](./schemas) directory and generates file that can be imported into you sanity database.

It handles few edge cases:

- the script will warn you on images being downloaded from google cdn (which cannot be imported using sanity-cli)
- it handles more than 100 entries per type
- it allows blacklisting broken/non-existing images

# How to run it

1. Generate bundle for migration
   ```
   node index --url https://your-site-url
   ```
2. Import it to sanity

   This script must be ran from your sanity folder ie. the one containing sanity.json!

   ```
       sanity dataset import ROUTE-TO-FILE DATABASE-NAME
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
5. Save everything in ndjson file to be consumed by sanity-cli

# Important notes

- script doesn't check if the file provide in wordpress exists which will break sanity import! You have to add the url to [missingImagesBlackList.js](missingImagesBlackList.js)
- images are exported as enhancedImage which includes alt and caption
- you can see the reference to schema used in [schemas](./schemas) directory

# TODO

- move blacklist to separate file that is not tracked by github

# Acknowledgments

When creating this solution I've leaned heavily on [wordpress-to-sanity repository](https://github.com/kmelve/wordpress-to-sanity).
