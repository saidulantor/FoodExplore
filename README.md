# Bistro Bliss — Restaurant Website

A modern, responsive restaurant website featuring animated food menus, an interactive shopping cart, live order tracking, customer order details, and bKash payment support.

## Project Structure

```text
BistroBliss/
├── index.html                  # Home page with animated hero section
├── menu.html                   # Full 5-category menu with live search, 3D tilt & cart drawer
├── order-confirmation.html     # Animated order confirmation, live tracker & bKash checkout
├── about.html                  # Restaurant story & animated statistics counter
├── contact.html                # Contact details, enquiry form & FAQ
├── Explore.html                # Explore page
├── assets/
│   ├── css/
│   │   ├── style.css           # Global theme, navbar, buttons & home hero styles
│   │   ├── menu.css            # Menu grid, search bar, animations & cart drawer styles
│   │   ├── order-confirmation.css # Confirmation hero, timeline, bKash box & print styles
│   │   ├── about.css           # About page styles
│   │   ├── contact.css         # Contact page & form styles
│   │   └── Explore.css         # Explore page styles
│   ├── js/
│   │   ├── menu-cart.js        # Cart state, flying particle, live search & 3D tilt
│   │   ├── order-confirmation.js # Dynamic order items, bKash box & countdown timer
│   │   └── about.js            # Animated statistics counter
│   └── images/
│       ├── hero/               # Hero & banner imagery
│       ├── biryani/            # Rice & Biryani dishes
│       ├── chicken-beef/       # Chicken & Beef dishes
│       ├── fast-food/          # Fast Food dishes
│       ├── snacks/             # Snacks & Street Food dishes
│       └── drinks-desserts/    # Drinks & Desserts
├── .gitignore
└── README.md
```

## Features

- **Interactive Menu**: 25 dishes across 5 categories with live search, sticky category sync, 3D hover tilt, and flying add-to-cart animations.
- **Dynamic Cart & Quantities**: Real-time item counter, slide-over cart drawer, and adjustable quantities on both the menu and confirmation pages.
- **Order Confirmation & Payment**: Animated SVG checkmark, confetti, live delivery countdown timer, empty-by-default customer details form, interactive **bKash** merchant payment section, and print-ready receipt layout.
- **Responsive & Accessible**: Works across desktop, tablet, and mobile devices with `prefers-reduced-motion` support.
