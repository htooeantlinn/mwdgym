package com.example.mwdgym.service;

import com.example.mwdgym.model.DietPlan;
import com.example.mwdgym.model.diet.DietPlanContent;
import com.example.mwdgym.model.diet.FoodItem;
import com.example.mwdgym.model.diet.MealBlock;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class DietPlanPdfService {

    private final ObjectMapper objectMapper = new ObjectMapper();

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

            Font fTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, new Color(44, 62, 80));
            Font fSub   = FontFactory.getFont(FontFactory.HELVETICA, 13, new Color(160, 160, 160));
            Font fSec   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(68, 68, 68));
            Font fTh    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(100, 116, 139));
            Font fTd    = FontFactory.getFont(FontFactory.HELVETICA, 13);
            Font fNum   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(148, 163, 184));
            Font fBold  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
            Font fNote  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(0, 128, 128));

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

    private void drawMeals(Document document, DietPlanContent content, Font secFont, Font titleFont, Font cellFont, Font numFont, Font boldFont, Font noteFont) throws Exception {
        float[] colWidths = {8f, 120f, 30f, 30f, 30f, 30f, 30f};

        for (int m = 0; m < content.getMeals().size(); m++) {
            MealBlock meal = content.getMeals().get(m);

            Paragraph mealTitle = new Paragraph(meal.getName() + " (" + meal.getItems().size() + " items)", titleFont);
            mealTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(mealTitle);

            if (meal.getItems().isEmpty()) {
                Paragraph empty = new Paragraph("No foods added");
                document.add(empty);
                document.add(new Paragraph(""));
                continue;
            }

            PdfPTable table = new PdfPTable(7);
            table.setWidths(colWidths);
            table.setWidthPercentage(100);

            String[] headers = {"#", "Food", "Qty", "Cal", "Protein", "Carbs", "Fat"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(header, secFont));
                cell.setPadding(4);
                cell.setBackgroundColor(new Color(236, 240, 241));
                table.addCell(cell);
            }

            for (int i = 0; i < meal.getItems().size(); i++) {
                FoodItem item = meal.getItems().get(i);
                table.addCell(new PdfPCell(new Paragraph(String.valueOf(i + 1), numFont)));
                table.addCell(new PdfPCell(new Paragraph(item.getFood(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(item.getQuantity(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(item.getCalories(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(item.getProtein(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(item.getCarbs(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(item.getFat(), cellFont)));
            }

            document.add(table);
            document.add(new Paragraph(""));
        }
    }

    private DietPlanContent defaultContent() {
        DietPlanContent content = new DietPlanContent();
        MealBlock breakfast = new MealBlock();
        breakfast.setName("Breakfast");
        FoodItem fi1 = new FoodItem();
        fi1.setFood("Oatmeal"); fi1.setQuantity("1 cup"); fi1.setCalories("150"); fi1.setProtein("5g"); fi1.setCarbs("27g"); fi1.setFat("3g");
        breakfast.getItems().add(fi1);
        FoodItem fi2 = new FoodItem();
        fi2.setFood("Boiled Eggs"); fi2.setQuantity("2 pcs"); fi2.setCalories("140"); fi2.setProtein("12g"); fi2.setCarbs("1g"); fi2.setFat("10g");
        breakfast.getItems().add(fi2);

        MealBlock lunch = new MealBlock();
        lunch.setName("Lunch");
        FoodItem fi3 = new FoodItem();
        fi3.setFood("Grilled Chicken"); fi3.setQuantity("150g"); fi3.setCalories("250"); fi3.setProtein("30g"); fi3.setCarbs("0g");
        lunch.getItems().add(fi3);
        FoodItem fi4 = new FoodItem();
        fi4.setFood("Brown Rice"); fi4.setQuantity("1 cup"); fi4.setCalories("215"); fi4.setProtein("5g"); fi4.setCarbs("45g"); fi4.setFat("1.5g");
        lunch.getItems().add(fi4);

        MealBlock dinner = new MealBlock();
        dinner.setName("Dinner");
        FoodItem fi5 = new FoodItem();
        fi5.setFood("Salmon"); fi5.setQuantity("150g"); fi5.setCalories("280"); fi5.setProtein("25g"); fi5.setCarbs("0g"); fi5.setFat("15g");
        dinner.getItems().add(fi5);
        FoodItem fi6 = new FoodItem();
        fi6.setFood("Steamed Vegetables"); fi6.setQuantity("1 cup"); fi6.setCalories("50"); fi6.setProtein("3g"); fi6.setCarbs("10g"); fi6.setFat("0g");
        dinner.getItems().add(fi6);

        MealBlock snack = new MealBlock();
        snack.setName("Snacks");
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