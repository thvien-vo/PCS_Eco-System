---
name: pcs-domain-knowledge
description: Background technical knowledge on FTIR, the plastic identification process, environmental/sensor requirements, and the B2B value proposition for Dow. Use when designing the PASS/REJECT logic for the Module 7 Kiosk, the Module 8 B2B Insight Snapshot content, or any copy that needs to explain HOW a real PCS machine would operate.
---

> **IMPORTANT NOTE**: This document provides BACKGROUND technical knowledge to make the UI copy for Module 7 and Module 8 sound scientifically accurate. It is **NOT** a requirement to build a real AI or FTIR system in this software demo.

## 1. FTIR Principle
Fourier-Transform Infrared Spectroscopy (FTIR) operates by measuring how infrared light is absorbed by plastic polymers across distinct wavelengths. The resulting absorption spectrum serves as an exact "chemical fingerprint" unique to each polymer's molecular structure.

## 2. Chemical Fingerprints of 5 Target Plastics
- **PET (Polyethylene Terephthalate):** Sharp carbonyl C=O peak near 1715 cm⁻¹, ester C-O absorption at 1240 cm⁻¹.
- **PE (Polyethylene - HDPE/LDPE):** Strong C-H stretching doublet at 2916 cm⁻¹ and 2848 cm⁻¹, C-H bending at 1463 cm⁻¹ and 719 cm⁻¹.
- **PP (Polypropylene):** Methyl C-H stretching near 2950 cm⁻¹, CH₃ umbrella bending at 1376 cm⁻¹.
- **PS (Polystyrene):** Aromatic C-H stretching above 3000 cm⁻¹, ring bending doublets at 756 cm⁻¹ and 698 cm⁻¹.
- **PVC (Polyvinyl Chloride):** C-Cl stretching absorption band in the 600–700 cm⁻¹ range.

## 3. 4-Step FTIR Identification Process
1. **Spectrum Acquisition:** Diffuse reflectance sensor captures reflected IR light from the sample surface.
2. **Preprocessing:** Baseline correction, noise filtering, vector normalization.
3. **Feature Extraction:** Wavelength intensity peak mapping against calibrated reference spectra.
4. **Classification:** Machine learning model (e.g., Random Forest or MobileNet-1D) calculates a confidence score.

## 4. 7 Environmental Requirements
1. **Ambient Light Mitigation:** Enclosed optical chamber to block external solar/fluorescent interference.
2. **IR Source Stability:** Controlled current supply to eliminate thermal drift of halogen/MEMS emitter.
3. **Distance/Geometry Control:** Fixed measurement focal point (e.g., 10mm ± 1mm).
4. **Sample Surface Condition:** Clean, dry surface free of heavy mud or liquid film.
5. **Ambient Temperature:** Operational range 15°C–35°C with internal temperature compensation.
6. **Humidity Control:** Non-condensing relative humidity (< 80% RH).
7. **Mechanical Vibration Isolation:** Shock-mounted optical bench inside the Kiosk frame.

## 5. 5 Sensor Key Specifications
1. **Spectral Resolution:** <= 8 nm across 900–1700 nm NIR range.
2. **Signal-to-Noise Ratio (SNR):** >= 1000:1 for fast single-scan acquisition (< 500ms).
3. **Emitter Lifetime:** Low-power MEMS IR emitter rated > 20,000 continuous hours.
4. **Optical Window:** Sapphire or AR-coated quartz protection window for scratch/wear resistance.
5. **Sample Surface Handling:** Automated air-blow cleaning jet to purge dust between scans.

## 6. Scientifically Plausible REJECT Reasons
These reasons apply to the Module 7 Kiosk logic:
1. **Low Confidence Score (< 85%):** Ambiguous spectrum matching multiple polymers.
2. **Out-of-Distribution (OOD) Material:** Non-recyclable plastic (e.g., Polycarbonate, ABS, multilayer foil) or non-plastic object.
3. **Dirty/Wet/Oxidized Sample:** Heavy surface contamination blocking IR beam penetration.
4. **Mixed/Composite Plastic:** Laminated layers impossible to separate mechanically.
5. **Particle/Sample Too Small (< 10µm / < 10mm):** Surface area insufficient to cover sensor aperture beam spot.

## 7. Dow B2B Value Proposition
These points are relevant for the Module 8 Insight:
- **Clean Feedstock Supply:** Pre-sorting plastics at consumer collection points guarantees higher purity inputs for Mechanical Recycling facilities.
- **Sorting Efficiency:** Reduces manual sorting overhead at regional Material Recovery Facilities (MRFs).
- **Data-as-a-Service Loop:** Every scan expands local waste stream analytics. "More data → higher classification accuracy → cleaner feedstock for Mechanical Recycling."
