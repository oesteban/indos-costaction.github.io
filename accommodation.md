---
title: Accommodation
---

<link rel="stylesheet" href="{{ '/assets/leaflet/leaflet.css' | relative_url }}" />
<script src="{{ '/assets/leaflet/leaflet.js' | relative_url }}"></script>
<link rel="stylesheet" href="{{ '/assets/css/accommodation.css' | relative_url }}">

The student residence near the venue has no spare capacity for this cohort, and
short-stay prices right around the venue (Salamanca/Chamartín) run high. The areas
below are a short, well-connected ride away on **Metro Lines 6 and 7** — both of which
meet the venue's own line at **Avenida de América**, one stop from the venue — and are
noticeably cheaper. Use the map or the filters below, or see
["Splitting an apartment with other attendees"](#splitting-an-apartment-with-other-attendees)
if you'd like help finding people to share with.

<div id="accommodation-map" class="accommodation-map"></div>

<div class="accommodation-filters">
  <div class="accommodation-search">
    <label for="accommodation-search-input">Search</label>
    <input type="text" id="accommodation-search" placeholder="Area, station..." />
  </div>
  <div class="accommodation-filter-line">
    <label for="accommodation-filter-line-select">Metro line</label>
    <select id="accommodation-filter-line">
      <option value="">Line 6 or 7</option>
    </select>
  </div>
  <div class="accommodation-filter-band">
    <label for="accommodation-filter-band-select">Price band</label>
    <select id="accommodation-filter-band">
      <option value="">Any</option>
    </select>
  </div>
  <button id="accommodation-fit" class="ts-cta__button" style="font-size:0.85rem; padding:0.4rem 0.9rem;">
    Fit map to results
  </button>
  <span id="accommodation-count" class="accommodation-count"></span>
</div>

<div id="accommodation-grid" class="accommodation-grid"></div>

> **A note on price bands.** These are rough, relative estimates for a first version of
> this page — not live prices. Booking.com/Airbnb links open a real search for the
> event dates so you can check current availability and prices directly.

## Splitting an apartment with other attendees

Several attendees booking the same apartment together, for the 3–4 nights of the
school, usually works out cheaper per person than everyone booking separately.

<div class="ts-cta">
  <div class="ts-cta__text">
    <p class="ts-cta__eyebrow">Want to coordinate with others?</p>
    <p class="ts-cta__note">Email us and, if others are interested too, we'll try to
    put you in touch — we'll always ask each side first before sharing any contact
    details, never without asking.</p>
  </div>
  <a class="ts-cta__button" href="mailto:oscar.esteban@hes-so.ch?subject=Training%20School%20-%20shared%20accommodation">Email us <span aria-hidden="true">→</span></a>
</div>

## Tips from COST's own guidance

- **Sharing the daily allowance.** When two eligible participants share the same
  accommodation, COST's Annotated Rules invite them to consider one claiming the full
  daily allowance and the other 50%, rather than both claiming in full.
- **Book something refundable.** COST advises booking refundable accommodation where
  possible, in case your plans change.

See [Reimbursement](/training#reimbursement) for how the daily allowance itself works.

<script>
window.ACCOMMODATION_DATA = {{ site.data.accommodation | jsonify }};
</script>
<script src="{{ '/assets/script/accommodation.js' | relative_url }}"></script>
