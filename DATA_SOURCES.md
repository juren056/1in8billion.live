# Dataset audit — 2026-10-20

data/countries.json is inherited game input. Source years, extraction scripts and row-level references are absent. Population appears to be in thousands; annual births are counts. These interpretations are disclosed as model assumptions, not verified current official facts.

Birth probability = births / sum(births); population mode = pop / sum(pop). Game and static calculator use the same table. Validation checks identifiers, positive finite values and normalized probability sums, not statistical accuracy.

Primary sources for future calibration: https://population.un.org/wpp/ and https://data.worldbank.org/indicator/SP.DYN.CBRT.IN and https://data.worldbank.org/indicator/SP.DYN.LE00.IN . Official World Bank API requests for eight proposed countries failed with network errors. No official records were retrieved. Country fact pages remain blocked pending provenance and years; the execution brief permits fewer pages instead of unsupported or thin content.

Income, education, mortality, careers and event outputs are simplified fiction. No copied third-party database was added.
