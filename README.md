# 32bits.io

Source for [32bits.io](https://32bits.io).

## Articles

Create drafts without publication dates:

```bash
npm run writing:new -- "Article Title"
npm run making:new -- "Dispatch Title"
```

Publish a draft when it is ready:

```bash
npm run publish -- writing/article-title
npm run publish -- making/dispatch-title
```

Drafts use `status: draft` and do not need `published`. Publishing switches
the status to `published`, stamps the current local `YYYY-MM-DD` calendar date,
and runs the site check.

To preview drafts, run the `dev::drafts` script:

```bash
npm run dev:drafts
```
