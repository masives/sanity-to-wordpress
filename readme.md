# How to run it

1. Generate bundle for migration
    ```
    node migrate-wordpress
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

- Parametrize api url
- move blacklist to separate file that is not tracked by github

# Acknowledgments

When creating this solution I've leaned heavily on [wordpress-to-sanity repository](https://github.com/kmelve/wordpress-to-sanity).
