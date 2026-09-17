package com.example.mwdgym.service;

import com.example.mwdgym.model.MarketplacePlan;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.model.WorkoutPlan;
import com.example.mwdgym.model.workout.DayBlock;
import com.example.mwdgym.model.workout.DaySection;
import com.example.mwdgym.model.workout.ExerciseRow;
import com.example.mwdgym.model.workout.WarmUpSection;
import com.example.mwdgym.model.workout.WorkoutPlanContent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkoutPlanPdfService {

    private final WorkoutPlanService workoutPlanService;
    private final ObjectMapper objectMapper;

    public WorkoutPlanPdfService(WorkoutPlanService workoutPlanService, ObjectMapper objectMapper) {
        this.workoutPlanService = workoutPlanService;
        this.objectMapper = objectMapper;
    }

    private record Theme(Color hdrBg, Color hdrFg, Color secBg, Color secFg, Color note) {}

    private Theme theme(String t) {
        if ("bw".equals(t))
            return new Theme(new Color(26, 26, 26), Color.WHITE,
                    new Color(240, 240, 240), new Color(68, 68, 68), new Color(0, 128, 128));
        if ("red".equals(t))
            return new Theme(new Color(180, 30, 30), Color.WHITE,
                    new Color(254, 226, 226), new Color(180, 30, 30), new Color(180, 30, 30));
        return new Theme(new Color(44, 62, 80), Color.WHITE,
                new Color(236, 240, 241), new Color(44, 62, 80), new Color(0, 128, 128));
    }

    public byte[] generatePdf(WorkoutPlan plan, boolean includeWarm, String daysParam) {
        String rawJson = plan.getContentJson();
        if (rawJson != null && rawJson.contains("\"exercises\"")) {
            return generatePdfNewFormat(plan, rawJson, includeWarm, daysParam);
        }
        WorkoutPlanContent content = workoutPlanService.parseContent(rawJson);
        Theme th = theme(plan.getTheme());

        java.util.Set<Integer> selectedDays = new java.util.HashSet<>();
        if (daysParam != null && !daysParam.isBlank()) {
            for (String s : daysParam.split(",")) {
                try { selectedDays.add(Integer.parseInt(s.trim())); } catch (NumberFormatException ignored) {}
            }
        } else {
            for (int i = 0; i < content.getDays().size(); i++) selectedDays.add(i);
        }

        Font fTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, th.hdrBg);
        Font fSub   = FontFactory.getFont(FontFactory.HELVETICA, 13, Color.GRAY);
        Font fHdr   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, th.hdrFg);
        Font fSec   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, th.secFg);
        Font fTh    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(100, 116, 139));
        Font fTd    = FontFactory.getFont(FontFactory.HELVETICA, 13);
        Font fNum   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(148, 163, 184));
        Font fBold  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
        Font fNote  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, th.note);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 18, 18, 18, 18);
            PdfWriter.getInstance(doc, out);
            doc.open();

            doc.add(new Paragraph(plan.getName(), fTitle));
            if (plan.getNotes() != null && !plan.getNotes().isBlank()) {
                doc.add(new Paragraph(plan.getNotes(), fSub));
            }
            doc.add(new Paragraph(" "));

            if (includeWarm && content.getWarmUp() != null && !content.getWarmUp().isEmpty()) {
                for (WarmUpSection section : content.getWarmUp()) {
                    List<ExerciseRow> valid = validRows(section.getRows());
                    if (valid.isEmpty()) continue;
                    PdfPTable warmBlock = buildFlatBlock(null, section.getLabel(), valid, th,
                            fHdr, fSec, fTh, fTd, fNum, fBold, fNote);
                    if (warmBlock == null) continue;
                    doc.add(warmBlock);
                    doc.add(new Paragraph(" "));
                }
            }

            int dayIdx = 0;
            for (DayBlock day : content.getDays()) {
                if (selectedDays.contains(dayIdx)) {
                    PdfPTable dayBlock = buildDayBlock(day, th, fHdr, fSec, fTh, fTd, fNum, fBold, fNote);
                    if (dayBlock == null) { dayIdx++; continue; }
                    doc.add(dayBlock);
                    doc.add(new Paragraph(" "));
                }
                dayIdx++;
            }

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    private byte[] generatePdfNewFormat(WorkoutPlan plan, String json, boolean includeWarm, String daysParam) {
        Theme th = theme(plan.getTheme());
        Font fTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, th.hdrBg);
        Font fSub   = FontFactory.getFont(FontFactory.HELVETICA, 13, Color.GRAY);
        Font fHdr   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, th.hdrFg);
        Font fTh    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(100, 116, 139));
        Font fTd    = FontFactory.getFont(FontFactory.HELVETICA, 13);
        Font fNum   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(148, 163, 184));
        Font fBold  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
        Font fNote  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, th.note);
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode daysNode = root.get("days");
            if (daysNode == null || !daysNode.isArray()) daysNode = objectMapper.createArrayNode();
            java.util.Set<Integer> selected = new java.util.HashSet<>();
            if (daysParam != null && !daysParam.isBlank()) {
                for (String s : daysParam.split(",")) try { selected.add(Integer.parseInt(s.trim())); } catch (NumberFormatException ignored) {}
            } else {
                for (int i = 0; i < daysNode.size(); i++) selected.add(i);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 18, 18, 18, 18);
            PdfWriter.getInstance(doc, out);
            doc.open();
            doc.add(new Paragraph(plan.getName(), fTitle));
            if (plan.getNotes() != null && !plan.getNotes().isBlank()) doc.add(new Paragraph(plan.getNotes(), fSub));
            doc.add(new Paragraph(" "));
            int idx = 0;
            for (JsonNode dayNode : daysNode) {
                if (!selected.contains(idx++)) continue;
                String dayName = dayNode.has("name") ? dayNode.get("name").asText("") : "Day";
                JsonNode exs = dayNode.get("exercises");
                if (exs == null || !exs.isArray() || exs.size() == 0) continue;
                List<ExerciseRow> rows = new ArrayList<>();
                for (JsonNode e : exs) {
                    String n = e.has("name") ? e.get("name").asText("") : "";
                    if (n == null || n.isBlank()) continue;
                    rows.add(parseNewFormatRow(e));
                }
                if (rows.isEmpty()) continue;
                PdfPTable block = new PdfPTable(1);
                block.setWidthPercentage(100);
                block.setKeepTogether(true);
                block.addCell(hdrCell(dayName, fHdr, th));
                PdfPTable exTable = buildExTable(rows, fTh, fTd, fNum, fBold, fNote);
                if (exTable == null) continue;
                PdfPCell wrap = new PdfPCell(exTable);
                wrap.setPadding(0);
                block.addCell(wrap);
                doc.add(block);
                doc.add(new Paragraph(" "));
            }
            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed (new format)", e);
        }
    }

    private ExerciseRow parseNewFormatRow(JsonNode e) {
        ExerciseRow r = new ExerciseRow();
        r.setName(e.has("name") ? e.get("name").asText("") : "");
        r.setCol1(e.has("sets") ? e.get("sets").asText("") : "");
        r.setCol2(e.has("reps") ? e.get("reps").asText("") : "");
        r.setCol3(e.has("weight") ? e.get("weight").asText("") : "");
        r.setCol4(e.has("notes") ? e.get("notes").asText("") : "");
        r.setKind(e.has("kind") ? e.get("kind").asText("single") : "single");
        JsonNode opts = e.get("optionItems");
        if (opts != null && opts.isArray()) {
            for (JsonNode o : opts) {
                String on = o.has("name") ? o.get("name").asText("") : "";
                if (on == null || on.isBlank()) continue;
                r.getOptionItems().add(parseNewFormatRow(o));
            }
        }
        return r;
    }

    private PdfPTable buildDayBlock(DayBlock day, Theme th,
                                     Font fHdr, Font fSec, Font fTh, Font fTd,
                                     Font fNum, Font fBold, Font fNote) throws Exception {
        List<DaySection> validSections = new ArrayList<>();
        for (DaySection s : day.getSections()) {
            if (!validRows(s.getRows()).isEmpty()) validSections.add(s);
        }
        if (validSections.isEmpty()) return null;
        PdfPTable block = new PdfPTable(1);
        block.setWidthPercentage(100);
        block.setKeepTogether(true);

        PdfPCell hdr = hdrCell(workoutPlanService.dayLabel(day.getDay()), fHdr, th);
        block.addCell(hdr);

        for (DaySection section : validSections) {
            String label = section.getLabel();
            if (label != null && !label.isBlank()) {
                PdfPCell sec = new PdfPCell(new Phrase(label, fSec));
                sec.setBackgroundColor(th.secBg);
                sec.setPadding(8f);
                sec.setBorderColor(new Color(226, 232, 240));
                block.addCell(sec);
            }
            PdfPTable exTable = buildExTable(validRows(section.getRows()), fTh, fTd, fNum, fBold, fNote);
            if (exTable == null) continue;
            PdfPCell exWrap = new PdfPCell(exTable);
            exWrap.setPadding(0);
            block.addCell(exWrap);
        }
        return block;
    }

    private PdfPTable buildFlatBlock(String title, String secLabel, List<ExerciseRow> rows, Theme th,
                                      Font fHdr, Font fSec, Font fTh, Font fTd,
                                      Font fNum, Font fBold, Font fNote) throws Exception {
        List<ExerciseRow> valid = validRows(rows);
        if (valid.isEmpty()) return null;
        PdfPTable block = new PdfPTable(1);
        block.setWidthPercentage(100);
        block.setKeepTogether(true);

        String hdrText = title != null ? title : (secLabel != null ? secLabel : "Warm up");
        block.addCell(hdrCell(hdrText, fHdr, th));

        PdfPTable exTable = buildExTable(valid, fTh, fTd, fNum, fBold, fNote);
        if (exTable == null) return null;
        PdfPCell exWrap = new PdfPCell(exTable);
        exWrap.setPadding(0);
        block.addCell(exWrap);
        return block;
    }

    private PdfPTable buildExTable(List<ExerciseRow> rows, Font fTh, Font fTd,
                                    Font fNum, Font fBold, Font fNote) throws Exception {
        List<ExerciseRow> valid = validRows(rows);
        if (valid.isEmpty()) return null;
        PdfPTable t = new PdfPTable(new float[]{5f, 30f, 7f, 7f, 10f, 18f});
        t.setWidthPercentage(100);
        t.setSplitLate(false);

        String[] headers = {"#", "EXERCISE", "SETS", "REPS", "WEIGHT", "NOTE"};
        for (String h : headers) {
            PdfPCell c = new PdfPCell(new Phrase(h, fTh));
            c.setBackgroundColor(new Color(248, 250, 252));
            c.setPadding(7f);
            c.setBorderColor(new Color(226, 232, 240));
            t.addCell(c);
        }

        int idx = 1;
        for (ExerciseRow r : valid) {
            String kind = r.getKind() != null ? r.getKind().trim().toLowerCase() : "single";
            boolean hasOptions = r.getOptionItems() != null && !r.getOptionItems().isEmpty();
            String label = r.getName();
            if (hasOptions) {
                label += "  [" + ("choice".equals(kind) ? "Choose 1" : "Mix") + "]";
            }
            t.addCell(numCell(String.valueOf(idx++), fNum));
            t.addCell(strCell(label, fBold, Element.ALIGN_LEFT));
            t.addCell(strCell(r.getCol1(), fTd, Element.ALIGN_CENTER));
            t.addCell(strCell(r.getCol2(), fTd, Element.ALIGN_CENTER));
            t.addCell(strCell(r.getCol3(), fTd, Element.ALIGN_CENTER));
            t.addCell(strCell(r.getCol4(), fNote, Element.ALIGN_LEFT));
            if (hasOptions) {
                for (ExerciseRow o : r.getOptionItems()) {
                    PdfPCell mark = strCell("↳", fNum, Element.ALIGN_CENTER);
                    t.addCell(mark);
                    t.addCell(strCell("↳ " + o.getName(), fTd, Element.ALIGN_LEFT));
                    t.addCell(strCell(o.getCol1(), fTd, Element.ALIGN_CENTER));
                    t.addCell(strCell(o.getCol2(), fTd, Element.ALIGN_CENTER));
                    t.addCell(strCell(o.getCol3(), fTd, Element.ALIGN_CENTER));
                    t.addCell(strCell(o.getCol4(), fNote, Element.ALIGN_LEFT));
                }
            }
        }
        return t;
    }

    private List<ExerciseRow> validRows(List<ExerciseRow> rows) {
        if (rows == null) return List.of();
        List<ExerciseRow> out = new ArrayList<>();
        for (ExerciseRow r : rows) {
            if (r.getName() != null && !r.getName().isBlank()) out.add(r);
        }
        return out;
    }

    private PdfPCell hdrCell(String text, Font f, Theme th) {
        PdfPCell c = new PdfPCell(new Phrase(text, f));
        c.setBackgroundColor(th.hdrBg);
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setPadding(10f);
        return c;
    }

    private PdfPCell numCell(String n, Font f) {
        PdfPCell c = new PdfPCell(new Phrase(n, f));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c.setPadding(6f);
        c.setBorderColor(new Color(241, 245, 249));
        return c;
    }

    private PdfPCell strCell(String text, Font f, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text != null ? text : "", f));
        c.setHorizontalAlignment(align);
        c.setPadding(6f);
        c.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c.setBorderColor(new Color(241, 245, 249));
        return c;
    }

    public byte[] generateMarketplacePlanPdf(MarketplacePlan plan, UserAccount trainer, String gymName) {
        if (gymName == null || gymName.isBlank()) gymName = "MWD FITNESS & GYM";
        Color brandRed = new Color(220, 38, 38);
        Color darkSlate = new Color(15, 23, 42);
        Color grayText = new Color(100, 116, 139);
        Color borderGray = new Color(226, 232, 240);
        Color bgLight = new Color(248, 250, 252);
        Color bgSub = new Color(241, 245, 249);

        Font fBrand = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, brandRed);
        Font fSub = FontFactory.getFont(FontFactory.HELVETICA, 10, grayText);
        Font fTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, darkSlate);
        Font fDesc = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(51, 65, 85));
        Font fBadge = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, darkSlate);
        Font fDayHdr = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.WHITE);
        Font fTh = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(71, 85, 105));
        Font fTd = FontFactory.getFont(FontFactory.HELVETICA, 11, darkSlate);
        Font fNum = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(148, 163, 184));
        Font fBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, darkSlate);
        Font fNote = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, new Color(100, 116, 139));
        Font fFooter = FontFactory.getFont(FontFactory.HELVETICA, 9, grayText);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 24, 24, 24, 24);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Brand Header Table
            PdfPTable headerTbl = new PdfPTable(2);
            headerTbl.setWidthPercentage(100);
            headerTbl.setWidths(new float[]{65f, 35f});

            PdfPCell leftHdr = new PdfPCell();
            leftHdr.setBorder(0);
            leftHdr.addElement(new Paragraph(gymName.toUpperCase(), fBrand));
            leftHdr.addElement(new Paragraph("OFFICIAL WORKOUT ROUTINE & TRAINING PROTOCOL", fSub));
            headerTbl.addCell(leftHdr);

            PdfPCell rightHdr = new PdfPCell();
            rightHdr.setBorder(0);
            rightHdr.setHorizontalAlignment(Element.ALIGN_RIGHT);
            String trainerName = trainer != null && trainer.getDisplayName() != null && !trainer.getDisplayName().isBlank()
                    ? trainer.getDisplayName() : (trainer != null ? trainer.getUsername() : "Certified Coach");
            Paragraph pTrainer = new Paragraph("COACH: " + trainerName.toUpperCase(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkSlate));
            pTrainer.setAlignment(Element.ALIGN_RIGHT);
            rightHdr.addElement(pTrainer);

            String durationStr = (plan.getDurationWeeks() != null ? plan.getDurationWeeks() : 4) + " WEEKS PROGRAM";
            Paragraph pDur = new Paragraph(durationStr, fSub);
            pDur.setAlignment(Element.ALIGN_RIGHT);
            rightHdr.addElement(pDur);
            headerTbl.addCell(rightHdr);

            doc.add(headerTbl);

            // Divider Bar
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell divCell = new PdfPCell();
            divCell.setBackgroundColor(brandRed);
            divCell.setFixedHeight(2.5f);
            divCell.setBorder(0);
            divider.addCell(divCell);
            doc.add(new Paragraph(" "));
            doc.add(divider);
            doc.add(new Paragraph(" "));

            // Plan Title
            Paragraph titlePara = new Paragraph(plan.getTitle(), fTitle);
            titlePara.setSpacingAfter(4f);
            doc.add(titlePara);

            // Badges Bar: Category | Difficulty | Split Type | Target Audience
            PdfPTable badgeTbl = new PdfPTable(4);
            badgeTbl.setWidthPercentage(100);
            badgeTbl.setWidths(new float[]{25f, 25f, 25f, 25f});

            addMetaBadge(badgeTbl, "CATEGORY", plan.getCategory() != null ? plan.getCategory().name() : "GENERAL", fSub, fBadge, bgLight, borderGray);
            addMetaBadge(badgeTbl, "DIFFICULTY", plan.getDifficultyLevel() != null ? plan.getDifficultyLevel().name() : "ALL LEVELS", fSub, fBadge, bgLight, borderGray);
            addMetaBadge(badgeTbl, "PLAN TYPE", plan.getPlanType() != null ? plan.getPlanType().name() : "WEEKLY", fSub, fBadge, bgLight, borderGray);
            addMetaBadge(badgeTbl, "TARGET AUDIENCE", plan.getTargetAudience() != null && !plan.getTargetAudience().isBlank() ? plan.getTargetAudience() : "All Athletes", fSub, fBadge, bgLight, borderGray);
            doc.add(badgeTbl);

            if (plan.getDescription() != null && !plan.getDescription().isBlank()) {
                doc.add(new Paragraph(" "));
                PdfPTable descTbl = new PdfPTable(1);
                descTbl.setWidthPercentage(100);
                PdfPCell descCell = new PdfPCell();
                descCell.setBackgroundColor(bgLight);
                descCell.setBorderColor(borderGray);
                descCell.setPadding(8f);
                descCell.addElement(new Paragraph("PROGRAM OVERVIEW", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, brandRed)));
                descCell.addElement(new Paragraph(plan.getDescription(), fDesc));
                descTbl.addCell(descCell);
                doc.add(descTbl);
            }

            doc.add(new Paragraph(" "));

            // Training Split Days
            String json = plan.getExercisesJson();
            if (json != null && !json.isBlank()) {
                JsonNode root = objectMapper.readTree(json);
                JsonNode daysNode = root.has("days") ? root.get("days") : (root.isArray() ? root : null);
                if (daysNode != null && daysNode.isArray()) {
                    int dayIndex = 1;
                    for (JsonNode d : daysNode) {
                        String dayName = d.has("name") && !d.get("name").asText().isBlank()
                                ? d.get("name").asText() : "Day " + dayIndex;
                        JsonNode exArray = d.has("exercises") ? d.get("exercises") : null;
                        if (exArray == null || !exArray.isArray() || exArray.size() == 0) {
                            dayIndex++;
                            continue;
                        }

                        PdfPTable dayTable = new PdfPTable(1);
                        dayTable.setWidthPercentage(100);
                        dayTable.setKeepTogether(true);

                        // Header cell for Day
                        PdfPCell dHdr = new PdfPCell(new Phrase(dayName.toUpperCase(), fDayHdr));
                        dHdr.setBackgroundColor(darkSlate);
                        dHdr.setPadding(8f);
                        dHdr.setHorizontalAlignment(Element.ALIGN_LEFT);
                        dayTable.addCell(dHdr);

                        // Exercises Table
                        PdfPTable exTable = new PdfPTable(new float[]{6f, 34f, 10f, 12f, 14f, 24f});
                        exTable.setWidthPercentage(100);

                        String[] headers = {"#", "EXERCISE", "SETS", "REPS", "WEIGHT", "COACHING NOTES"};
                        for (String h : headers) {
                            PdfPCell c = new PdfPCell(new Phrase(h, fTh));
                            c.setBackgroundColor(bgSub);
                            c.setPadding(6f);
                            c.setBorderColor(borderGray);
                            c.setHorizontalAlignment(h.equals("EXERCISE") || h.equals("COACHING NOTES") ? Element.ALIGN_LEFT : Element.ALIGN_CENTER);
                            exTable.addCell(c);
                        }

                        int exNum = 1;
                        for (JsonNode ex : exArray) {
                            String name = ex.has("name") ? ex.get("name").asText("") : "";
                            if (name.isBlank()) continue;
                            String sets = ex.has("sets") ? ex.get("sets").asText("-") : "-";
                            String reps = ex.has("reps") ? ex.get("reps").asText("-") : "-";
                            String weight = ex.has("weight") ? ex.get("weight").asText("-") : "-";
                            String notes = ex.has("notes") ? ex.get("notes").asText("") : "";

                            Color rowBg = (exNum % 2 == 0) ? bgLight : Color.WHITE;

                            PdfPCell cNum = new PdfPCell(new Phrase(String.valueOf(exNum++), fNum));
                            cNum.setBackgroundColor(rowBg);
                            cNum.setBorderColor(borderGray);
                            cNum.setHorizontalAlignment(Element.ALIGN_CENTER);
                            cNum.setPadding(6f);
                            exTable.addCell(cNum);

                            PdfPCell cName = new PdfPCell(new Phrase(name, fBold));
                            cName.setBackgroundColor(rowBg);
                            cName.setBorderColor(borderGray);
                            cName.setPadding(6f);
                            exTable.addCell(cName);

                            PdfPCell cSets = new PdfPCell(new Phrase(sets, fTd));
                            cSets.setBackgroundColor(rowBg);
                            cSets.setBorderColor(borderGray);
                            cSets.setHorizontalAlignment(Element.ALIGN_CENTER);
                            cSets.setPadding(6f);
                            exTable.addCell(cSets);

                            PdfPCell cReps = new PdfPCell(new Phrase(reps, fTd));
                            cReps.setBackgroundColor(rowBg);
                            cReps.setBorderColor(borderGray);
                            cReps.setHorizontalAlignment(Element.ALIGN_CENTER);
                            cReps.setPadding(6f);
                            exTable.addCell(cReps);

                            PdfPCell cWeight = new PdfPCell(new Phrase(weight, fTd));
                            cWeight.setBackgroundColor(rowBg);
                            cWeight.setBorderColor(borderGray);
                            cWeight.setHorizontalAlignment(Element.ALIGN_CENTER);
                            cWeight.setPadding(6f);
                            exTable.addCell(cWeight);

                            PdfPCell cNotes = new PdfPCell(new Phrase(notes, fNote));
                            cNotes.setBackgroundColor(rowBg);
                            cNotes.setBorderColor(borderGray);
                            cNotes.setPadding(6f);
                            exTable.addCell(cNotes);
                        }

                        PdfPCell exWrap = new PdfPCell(exTable);
                        exWrap.setPadding(0);
                        dayTable.addCell(exWrap);

                        doc.add(dayTable);
                        doc.add(new Paragraph(" "));
                        dayIndex++;
                    }
                }
            }

            // Extra module: Macro Planning
            if (Boolean.TRUE.equals(plan.getIncludeMacroPlanning())) {
                PdfPTable macroTbl = new PdfPTable(1);
                macroTbl.setWidthPercentage(100);
                macroTbl.setKeepTogether(true);
                PdfPCell mCell = new PdfPCell();
                mCell.setBackgroundColor(new Color(240, 253, 244));
                mCell.setBorderColor(new Color(187, 247, 208));
                mCell.setPadding(8f);
                mCell.addElement(new Paragraph("NUTRITION & MACRONUTRIENT GUIDELINES", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(22, 101, 52))));
                mCell.addElement(new Paragraph("Aim for 1.6-2.2g of protein per kg body weight daily. Prioritize whole carbohydrates around training windows and maintain healthy fats for hormonal balance. Stay hydrated with 3-4 liters of water daily.", fDesc));
                macroTbl.addCell(mCell);
                doc.add(macroTbl);
                doc.add(new Paragraph(" "));
            }

            // Extra module: Supplement Guide
            if (Boolean.TRUE.equals(plan.getIncludeSupplementGuide())) {
                PdfPTable suppTbl = new PdfPTable(1);
                suppTbl.setWidthPercentage(100);
                suppTbl.setKeepTogether(true);
                PdfPCell sCell = new PdfPCell();
                sCell.setBackgroundColor(new Color(254, 249, 195));
                sCell.setBorderColor(new Color(254, 240, 138));
                sCell.setPadding(8f);
                sCell.addElement(new Paragraph("RECOMMENDED SUPPLEMENT PROTOCOL", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(133, 77, 14))));
                sCell.addElement(new Paragraph("1. Whey Protein Isolate (25g post-workout)\n2. Creatine Monohydrate (5g daily consistent timing)\n3. Electrolytes & Essential Amino Acids during intense sessions\n4. Multivitamin & Omega-3 with morning meal.", fDesc));
                suppTbl.addCell(sCell);
                doc.add(suppTbl);
                doc.add(new Paragraph(" "));
            }

            // Footer
            Paragraph footer = new Paragraph(gymName + " • Certified Athletic Conditioning • Train Hard & Stay Disciplined", fFooter);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Marketplace plan PDF generation failed", e);
        }
    }

    private void addMetaBadge(PdfPTable table, String label, String value, Font fLabel, Font fValue, Color bg, Color border) {
        PdfPCell c = new PdfPCell();
        c.setBackgroundColor(bg);
        c.setBorderColor(border);
        c.setPadding(6f);
        c.addElement(new Paragraph(label, fLabel));
        c.addElement(new Paragraph(value, fValue));
        table.addCell(c);
    }
}
