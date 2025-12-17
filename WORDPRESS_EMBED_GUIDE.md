# WordPress Embedding Guide

This guide explains how to embed your Next.js birth chart tool into a WordPress website.

## Option 1: Iframe Embedding (Easiest)

### Step 1: Deploy Your Next.js App

Deploy your app to a hosting service:

**Vercel (Recommended - Free):**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `ASTRO_API_KEY`
5. Deploy

**Netlify (Alternative):**
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. Add environment variables
5. Deploy

### Step 2: Get Your App URL

After deployment, you'll get a URL like:
- `https://your-app-name.vercel.app`
- `https://your-app-name.netlify.app`

### Step 3: Add to WordPress

#### Method A: Using a Custom HTML Block

1. In WordPress editor, add a **Custom HTML** block
2. Paste this code:

```html
<div style="width: 100%; height: 800px; border: none;">
  <iframe 
    src="https://your-app-name.vercel.app/chart-tool" 
    width="100%" 
    height="800px" 
    frameborder="0"
    scrolling="auto"
    style="border: none; min-height: 800px;">
  </iframe>
</div>
```

#### Method B: Using Shortcode (Better for Reusability)

1. Add this to your theme's `functions.php` or create a custom plugin:

```php
function birth_chart_embed_shortcode($atts) {
    $atts = shortcode_atts(array(
        'url' => 'https://your-app-name.vercel.app/chart-tool',
        'height' => '800px',
        'width' => '100%'
    ), $atts);
    
    return '<div style="width: ' . esc_attr($atts['width']) . '; height: ' . esc_attr($atts['height']) . '; border: none;">
        <iframe 
            src="' . esc_url($atts['url']) . '" 
            width="' . esc_attr($atts['width']) . '" 
            height="' . esc_attr($atts['height']) . '" 
            frameborder="0"
            scrolling="auto"
            style="border: none; min-height: ' . esc_attr($atts['height']) . ';">
        </iframe>
    </div>';
}
add_shortcode('birth_chart', 'birth_chart_embed_shortcode');
```

2. Then use in any post/page: `[birth_chart]` or `[birth_chart height="1000px"]`

#### Method C: Using a Page Template

1. Create a custom page template in your theme
2. Add the iframe code directly in the template

## Option 2: WordPress Plugin (Advanced)

Create a simple WordPress plugin:

### Create Plugin File: `birth-chart-tool/birth-chart-tool.php`

```php
<?php
/**
 * Plugin Name: Birth Chart Tool
 * Description: Embed the birth chart calculator
 * Version: 1.0.0
 */

function birth_chart_tool_shortcode($atts) {
    $default_url = 'https://your-app-name.vercel.app/chart-tool';
    $atts = shortcode_atts(array(
        'url' => $default_url,
        'height' => '800px',
        'width' => '100%'
    ), $atts);
    
    $url = esc_url($atts['url']);
    $height = esc_attr($atts['height']);
    $width = esc_attr($atts['width']);
    
    return sprintf(
        '<div class="birth-chart-container" style="width: %s; height: %s; position: relative; overflow: hidden;">
            <iframe 
                src="%s" 
                width="%s" 
                height="%s" 
                frameborder="0"
                scrolling="auto"
                style="border: none; width: 100%%; height: 100%%; min-height: %s;"
                allow="geolocation"
                loading="lazy">
            </iframe>
        </div>',
        $width,
        $height,
        $url,
        $width,
        $height,
        $height
    );
}
add_shortcode('birth_chart', 'birth_chart_tool_shortcode');

// Add admin settings page
function birth_chart_tool_settings() {
    add_options_page(
        'Birth Chart Tool Settings',
        'Birth Chart Tool',
        'manage_options',
        'birth-chart-tool',
        'birth_chart_tool_settings_page'
    );
}
add_action('admin_menu', 'birth_chart_tool_settings');

function birth_chart_tool_settings_page() {
    if (isset($_POST['submit'])) {
        update_option('birth_chart_tool_url', sanitize_text_field($_POST['chart_url']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    $current_url = get_option('birth_chart_tool_url', 'https://your-app-name.vercel.app/chart-tool');
    ?>
    <div class="wrap">
        <h1>Birth Chart Tool Settings</h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row">Chart Tool URL</th>
                    <td>
                        <input type="url" name="chart_url" value="<?php echo esc_attr($current_url); ?>" class="regular-text" />
                        <p class="description">Enter the URL of your deployed Next.js app</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
```

## Option 3: Direct Integration (Most Control)

If you want more control, you can:

1. **Create a WordPress REST API endpoint** that calls your Next.js API
2. **Build a custom WordPress block** using Gutenberg
3. **Use WordPress AJAX** to communicate with your Next.js backend

## Responsive Design

For mobile-friendly embedding, use this responsive code:

```html
<div class="birth-chart-wrapper" style="position: relative; padding-bottom: 100%; height: 0; overflow: hidden; max-width: 100%;">
    <iframe 
        src="https://your-app-name.vercel.app/chart-tool" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
        frameborder="0"
        scrolling="auto"
        allow="geolocation">
    </iframe>
</div>
```

Or with a fixed minimum height:

```html
<div style="width: 100%; min-height: 800px;">
    <iframe 
        src="https://your-app-name.vercel.app/chart-tool" 
        width="100%" 
        height="800px" 
        frameborder="0"
        scrolling="auto"
        style="border: none; min-height: 800px;"
        allow="geolocation">
    </iframe>
</div>
```

## CSS Styling (Optional)

Add custom CSS to your WordPress theme:

```css
.birth-chart-container {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin: 20px 0;
}

.birth-chart-container iframe {
    border-radius: 8px;
}
```

## Security Considerations

1. **CSP Headers**: If your WordPress site has Content Security Policy, add your app domain:
   ```
   frame-src https://your-app-name.vercel.app;
   ```

2. **X-Frame-Options**: Make sure your Next.js app allows iframe embedding (it does by default)

3. **HTTPS**: Always use HTTPS for both WordPress and your Next.js app

## Testing

1. Test on desktop and mobile
2. Test form submission
3. Test chart display
4. Check console for any errors

## Quick Start (Simplest Method)

1. Deploy to Vercel (5 minutes)
2. Copy your app URL
3. Add this to any WordPress post/page:

```html
<iframe src="https://your-app.vercel.app/chart-tool" width="100%" height="800px" frameborder="0"></iframe>
```

That's it! Your birth chart tool is now embedded in WordPress.

