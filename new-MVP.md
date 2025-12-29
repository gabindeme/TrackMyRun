# TrackMyRun – Advanced Stats & Analytics Specification

## Context
TrackMyRun is a web application that connects to the Strava API to provide advanced analytics, insights, and visual storytelling for endurance athletes (running-first).

The MVP already exists. This document defines **all additional statistics, insights, and derived metrics** to implement next.

Constraints:
- Use **Strava API data only** (activities, streams, zones, segments when available)
- No social graph data (only kudos_count)
- Respect API rate limits
- Derived metrics are allowed

---

## Data Sources (Strava API)

### Activity Fields
- id
- type
- sport_type
- start_date
- start_date_local
- moving_time
- elapsed_time
- distance
- total_elevation_gain
- average_speed
- max_speed
- average_heartrate
- max_heartrate
- suffer_score / relative_effort
- average_cadence
- kudos_count
- gear_id
- start_latlng / end_latlng
- timezone
- manual
- visibility

### Optional Streams (If Enabled)
- time
- distance
- altitude
- velocity_smooth
- heartrate
- cadence
- grade_smooth

---

## 1. Global Summary Metrics

### Totals (All Time / Year / Month)
- Total distance
- Total moving time
- Total elevation gain
- Total activities
- Average distance per activity
- Average duration per activity

---

## 2. Time-Based Aggregations

Compute stats for:
- Weekly
- Monthly
- Yearly
- Rolling 7 / 30 / 90 days

Metrics:
- Distance
- Time
- Elevation
- Activities count
- Average pace

---

## 3. Sport & Activity Type Breakdown

For each sport type:
- Total distance
- Total time
- Total elevation
- Number of activities
- % of total volume
- Average pace

---

## 4. Pace, Speed & Distance Metrics

### Pace
- Average pace
- Median pace
- Best pace
- Pace trend (time series)
- Pace distribution (histogram)

### Distance
- Longest activity
- Distance per week/month
- Cumulative distance
- Distance milestones (100, 500, 1000 km)

---

## 5. Elevation & Terrain

- Total elevation gain
- Elevation gain per km
- Hilliest activity
- Elevation trend over time
- Flat vs hilly ratio (threshold-based)

---

## 6. Heart Rate Analytics (If Data Exists)

- Average HR
- Max HR
- HR trend
- HR vs pace correlation
- Time spent in HR zones
- Easy vs hard effort ratio

---

## 7. Training Load & Intensity

Derived metrics:
- Weekly training load
- Relative effort aggregation
- Acute / chronic workload ratio (ACWR)
- Intensity distribution
- Overtraining risk heuristic

---

## 8. Cadence & Running Dynamics

- Average cadence
- Cadence trend
- Cadence vs pace correlation
- Low vs high cadence distribution

---

## 9. Personal Records & Benchmarks

- Fastest 1K / 5K / 10K / Half / Marathon
- Longest run
- Highest elevation gain
- Best effort (relative effort)

---

## 10. Segments (Optional)

- Most attempted segments
- Segment PRs
- Segment improvement trends

---

## 11. Consistency & Streaks

- Weekly activity consistency
- Training streaks
- Longest streak
- Missed-week detection
- Consistency score (0–100)

---

## 12. Geographic Insights

- Most frequent locations
- City / country breakdown
- Heatmap-ready data
- New locations discovered

---

## 13. Gear & Equipment Analytics

For each gear_id:
- Total distance
- Total time
- Average pace
- Shoe usage alerts (threshold-based)
- Gear performance comparison

---

## 14. Kudos Analytics (Social Metrics)

### Basic
- Total kudos
- Average kudos per activity
- Median kudos
- Max kudos on one activity

### Time-Based
- Kudos per week / month
- Kudos trend over time
- Year-over-year kudos comparison

### Correlations
- Kudos vs distance
- Kudos vs pace
- Kudos vs elevation
- Kudos per km
- Kudos per hour

### Activity-Type Insights
- Average kudos by sport
- Most liked activity type
- Long runs vs short runs kudos ratio

### Behavioral Insights
- Kudos by weekday
- Kudos by time of day
- Posting frequency vs kudos

### Leaderboards
- Most kudos’d activities
- Highest kudos per km
- Highest kudos per hour

### Derived Scores
- Kudos score
- Engagement index (0–100)
- Visibility score

---

## 15. Trends & Comparisons

- This year vs last year
- Best and worst months
- Seasonal patterns
- Pre/post major event comparison

---

## 16. Advanced Derived Scores

- Consistency score
- Endurance score
- Efficiency score (pace vs HR)
- Fatigue indicator
- Improvement index
- Plateau detection

---

## 17. Year in Sport (Spotify Wrapped Style)

### Core Stats
- Total distance / time / elevation
- Activities count
- Longest and fastest activity
- Most active month
- Favorite weekday

### Social & Fun
- Total kudos received
- Most liked activity
- Favorite distance
- Most used gear
- Fun equivalence stats

### Output
- Slide-based recap
- Shareable cards
- Image export (PNG)

---

## 18. Data Quality & Transparency

- Last sync date
- Missing data indicators (HR, cadence)
- Private activity warnings
- API rate limit awareness

---

## Implementation Notes
- Cache all activities locally
- Prefer incremental syncs
- Normalize metrics where relevant
- Always handle missing fields gracefully
- Derived metrics must be explainable

---

## Goal
Transform raw Strava data into **clear, actionable, and visually compelling insights**, going beyond Strava Free and approaching premium-level analytics.

