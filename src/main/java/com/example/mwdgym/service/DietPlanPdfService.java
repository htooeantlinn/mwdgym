package com.example.mwdgym.service;

import com.example.mwdgym.model.DietPlan;
import com.example.mwdgym.model.diet.DietPlanContent;
import com.example.mwdgym.model.diet.FoodItem;
import com.example.mwdgym.model.diet.MealBlock;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class DietPlanPdfService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private volatile BaseFont mmRegular;
    private volatile BaseFont mmBold;
    private volatile boolean mmTried;

    // Padauk (OFL) bundled under src/main/resources/fonts — covers Myanmar + Latin.
    private void ensureMmFonts() {
        if (mmTried) return;
        mmTried = true;
        try {
            byte[] reg = readFont("/fonts/Padauk-Regular.ttf");
            byte[] bold = readFont("/fonts/Padauk-Bold.ttf");
            if (reg != null) mmRegular = BaseFont.createFont("Padauk-Regular.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, reg, null);
            if (bold != null) mmBold = BaseFont.createFont("Padauk-Bold.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, bold, null);
        } catch (Exception e) {
            mmRegular = null;
            mmBold = null;
        }
    }

    private byte[] readFont(String path) {
        try (InputStream in = getClass().getResourceAsStream(path)) {
            if (in == null) return null;
            return in.readAllBytes();
        } catch (Exception e) {
            return null;
        }
    }

    private Font mmFont(float size, boolean bold, Color color) {
        ensureMmFonts();
        BaseFont bf = bold ? mmBold : mmRegular;
        if (bf == null) bf = bold ? mmRegular : null;
        if (bf == null) {
            return bold
                    ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, size, color)
                    : FontFactory.getFont(FontFactory.HELVETICA, size, color);
        }
        return new Font(bf, size, Font.NORMAL, color);
    }

    public byte[] generatePdf(DietPlan plan) {
        DietPlanContent content;
        try {
            content = objectMapper.readValue(plan.getContentJson(), DietPlanContent.class);
        } catch (Exception e) {
            content = defaultContent();
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 18, 18, 18, 18);
            PdfWriter.getInstance(document, out);
            document.open();

            Font fTitle = mmFont(24, true, new Color(44, 62, 80));
            Font fSub   = mmFont(13, false, new Color(160, 160, 160));
            Font fSec   = mmFont(13, true, new Color(68, 68, 68));
            Font fTh    = mmFont(11, true, new Color(100, 116, 139));
            Font fTd    = mmFont(13, false, Color.BLACK);
            Font fNum   = mmFont(12, true, new Color(148, 163, 184));
            Font fBold  = mmFont(13, true, Color.BLACK);
            Font fNote  = mmFont(12, true, new Color(0, 128, 128));

            document.add(new Paragraph(plan.getName(), fTitle));
            if (plan.getNotes() != null && !plan.getNotes().isEmpty()) {
                document.add(new Paragraph(plan.getNotes(), fSub));
            }
            document.add(new Paragraph(" "));

            drawMeals(document, content, fSec, fTh, fTd, fNum, fBold, fNote);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate diet plan PDF", e);
        }
    }

    private String legacyDetail(FoodItem item) {
        String kind = item.getKind() != null ? item.getKind().trim().toLowerCase() : "single";
        String opts = item.getOptions() != null ? item.getOptions().trim() : "";
        if (opts.isEmpty()) return "";
        if ("choice".equals(kind)) return "Choose 1: " + opts;
        if ("mix".equals(kind)) return "Mix: " + opts;
        return opts;
    }

    private String optionLine(FoodItem opt) {
        StringBuilder sb = new StringBuilder("\u2022 ");
        sb.append(opt.getFood() != null ? opt.getFood() : "");
        if (opt.getQuantity() != null && !opt.getQuantity().trim().isEmpty()) {
            sb.append(" ").append(opt.getQuantity().trim());
        }
        if (opt.getCalories() != null && !opt.getCalories().trim().isEmpty()) {
            sb.append(" (").append(opt.getCalories().trim()).append(" cal)");
        }
        return sb.toString();
    }

    private PdfPCell paddedCell(Paragraph p) {
        PdfPCell cell = new PdfPCell(p);
        cell.setPadding(6);
        cell.setLeading(0, 1.4f);
        return cell;
    }

    private void addRow(PdfPTable table, String num, String food, FoodItem item, Font cellFont, Font numFont, Font noteFont) {
        table.addCell(paddedCell(new Paragraph(num, numFont)));
        table.addCell(paddedCell(new Paragraph(food, cellFont)));
        table.addCell(paddedCell(new Paragraph(item.getQuantity(), cellFont)));
        table.addCell(paddedCell(new Paragraph(item.getCalories(), cellFont)));
        table.addCell(paddedCell(new Paragraph(item.getProtein(), cellFont)));
        table.addCell(paddedCell(new Paragraph(item.getCarbs(), cellFont)));
        table.addCell(paddedCell(new Paragraph(item.getFat(), cellFont)));
        table.addCell(paddedCell(new Paragraph(item.getNotes() != null ? item.getNotes() : "", noteFont)));
    }

    private void addOptionRow(PdfPTable table, String food, FoodItem opt, Font cellFont, Font numFont, Font noteFont) {
        PdfPCell numCell = paddedCell(new Paragraph("\u21B3", numFont));
        numCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(numCell);
        PdfPCell foodCell = paddedCell(new Paragraph(food, cellFont));
        foodCell.setPaddingLeft(14);
        table.addCell(foodCell);
        table.addCell(paddedCell(new Paragraph(opt.getQuantity(), cellFont)));
        table.addCell(paddedCell(new Paragraph(opt.getCalories(), cellFont)));
        table.addCell(paddedCell(new Paragraph(opt.getProtein(), cellFont)));
        table.addCell(paddedCell(new Paragraph(opt.getCarbs(), cellFont)));
        table.addCell(paddedCell(new Paragraph(opt.getFat(), cellFont)));
        table.addCell(paddedCell(new Paragraph(opt.getNotes() != null ? opt.getNotes() : "", noteFont)));
    }

    private void drawMeals(Document document, DietPlanContent content, Font secFont, Font titleFont, Font cellFont, Font numFont, Font boldFont, Font noteFont) throws Exception {
        float[] colWidths = {8f, 100f, 28f, 28f, 38f, 38f, 38f, 55f};
        Font headFont = mmFont(10, true, new Color(100, 116, 139));

        for (int m = 0; m < content.getMeals().size(); m++) {
            MealBlock meal = content.getMeals().get(m);
            if (meal.getItems() == null) meal.setItems(new ArrayList<>());

            Paragraph mealTitle = new Paragraph(meal.getName() + "  (" + meal.getItems().size() + " items)", secFont);
            mealTitle.setAlignment(Element.ALIGN_CENTER);
            mealTitle.setSpacingAfter(2);
            document.add(mealTitle);

            String timeRange = mealTimeRange(meal);
            if (!timeRange.isEmpty()) {
                Paragraph timePara = new Paragraph(timeRange, titleFont);
                timePara.setAlignment(Element.ALIGN_CENTER);
                timePara.setSpacingAfter(6);
                document.add(timePara);
            }

            if (meal.getItems().isEmpty()) {
                Paragraph empty = new Paragraph("No foods added");
                document.add(empty);
                document.add(new Paragraph(""));
                continue;
            }

            PdfPTable table = new PdfPTable(8);
            table.setWidths(colWidths);
            table.setWidthPercentage(100);
            table.setKeepTogether(true);

            String[] headers = {"#", "Food", "Qty", "Cal", "Protein", "Carbs", "Fat", "Note"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(header, headFont));
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setBackgroundColor(new Color(236, 240, 241));
                table.addCell(cell);
            }
            table.setHeaderRows(1);

            for (int i = 0; i < meal.getItems().size(); i++) {
                FoodItem item = meal.getItems().get(i);
                String kind = item.getKind() != null ? item.getKind().trim().toLowerCase() : "single";
                boolean hasOptions = item.getOptionItems() != null && !item.getOptionItems().isEmpty();

                String foodLabel = item.getFood();
                if (hasOptions) {
                    foodLabel += "  [" + ("choice".equals(kind) ? "Choose 1" : "Mix") + "]";
                }
                addRow(table, String.valueOf(i + 1), foodLabel, item, cellFont, numFont, noteFont);

                if (hasOptions) {
                    for (FoodItem opt : item.getOptionItems()) {
                        addOptionRow(table, opt.getFood() != null ? opt.getFood() : "",
                                opt, cellFont, numFont, noteFont);
                    }
                } else {
                    String detail = legacyDetail(item);
                    if (!detail.isEmpty()) {
                        PdfPCell detailCell = new PdfPCell(new Paragraph(detail, noteFont));
                        detailCell.setColspan(8);
                        table.addCell(detailCell);
                    }
                }
            }

            document.add(table);
            document.add(new Paragraph(""));
        }
    }

    private String mealTimeRange(MealBlock meal) {
        String s = meal.getStartTime() != null ? meal.getStartTime().trim() : "";
        String e = meal.getEndTime() != null ? meal.getEndTime().trim() : "";
        if (s.isEmpty() && e.isEmpty()) return "";
        if (s.isEmpty()) return "until " + e;
        if (e.isEmpty()) return "from " + s;
        return s + " - " + e;
    }

    private DietPlanContent defaultContent() {
        DietPlanContent content = new DietPlanContent();
        MealBlock breakfast = new MealBlock();
        breakfast.setName("Breakfast");
        breakfast.setStartTime("07:00");
        breakfast.setEndTime("08:00");
        FoodItem fi1 = new FoodItem();
        fi1.setFood("Oatmeal"); fi1.setQuantity("1 cup"); fi1.setCalories("150"); fi1.setProtein("5g"); fi1.setCarbs("27g"); fi1.setFat("3g");
        breakfast.getItems().add(fi1);
        FoodItem fi2 = new FoodItem();
        fi2.setFood("Boiled Eggs"); fi2.setQuantity("2 pcs"); fi2.setCalories("140"); fi2.setProtein("12g"); fi2.setCarbs("1g"); fi2.setFat("10g");
        breakfast.getItems().add(fi2);

        MealBlock lunch = new MealBlock();
        lunch.setName("Lunch");
        lunch.setStartTime("12:00");
        lunch.setEndTime("13:00");
        FoodItem fi3 = new FoodItem();
        fi3.setFood("Grilled Chicken"); fi3.setQuantity("150g"); fi3.setCalories("250"); fi3.setProtein("30g"); fi3.setCarbs("0g");
        lunch.getItems().add(fi3);
        FoodItem fi4 = new FoodItem();
        fi4.setFood("Brown Rice"); fi4.setQuantity("1 cup"); fi4.setCalories("215"); fi4.setProtein("5g"); fi4.setCarbs("45g"); fi4.setFat("1.5g");
        lunch.getItems().add(fi4);

        MealBlock dinner = new MealBlock();
        dinner.setName("Dinner");
        dinner.setStartTime("18:00");
        dinner.setEndTime("19:00");
        FoodItem fi5 = new FoodItem();
        fi5.setFood("Salmon"); fi5.setQuantity("150g"); fi5.setCalories("280"); fi5.setProtein("25g"); fi5.setCarbs("0g"); fi5.setFat("15g");
        dinner.getItems().add(fi5);
        FoodItem fi6 = new FoodItem();
        fi6.setFood("Steamed Vegetables"); fi6.setQuantity("1 cup"); fi6.setCalories("50"); fi6.setProtein("3g"); fi6.setCarbs("10g"); fi6.setFat("0g");
        dinner.getItems().add(fi6);

        MealBlock snack = new MealBlock();
        snack.setName("Snacks");
        snack.setStartTime("15:00");
        snack.setEndTime("15:30");
        FoodItem fi7 = new FoodItem();
        fi7.setFood("Apple"); fi7.setQuantity("1 medium"); fi7.setCalories("95"); fi7.setProtein("0g"); fi7.setCarbs("25g"); fi7.setFat("0g");
        snack.getItems().add(fi7);
        FoodItem fi8 = new FoodItem();
        fi8.setFood("Greek Yogurt"); fi8.setQuantity("150g"); fi8.setCalories("120"); fi8.setProtein("10g"); fi8.setCarbs("6g"); fi8.setFat("4g");
        snack.getItems().add(fi8);

        content.getMeals().add(breakfast);
        content.getMeals().add(lunch);
        content.getMeals().add(dinner);
        content.getMeals().add(snack);
        return content;
    }

    public DietPlanContent normalizeContent(DietPlanContent content) {
        if (content == null) {
            return defaultContent();
        }
        if (content.getMeals() == null) {
            content.setMeals(new ArrayList<>());
        }
        for (MealBlock meal : content.getMeals()) {
            if (meal.getItems() == null) {
                meal.setItems(new ArrayList<>());
            }
        }
        return content;
    }
}