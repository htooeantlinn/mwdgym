package com.example.mwdgym.config;

import com.example.mwdgym.model.FoodLibrary;
import com.example.mwdgym.repository.FoodLibraryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class FoodLibraryInit implements CommandLineRunner {
    private final FoodLibraryRepository repo;
    public FoodLibraryInit(FoodLibraryRepository repo) { this.repo = repo; }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        // Starter system foods (createdBy = null => System Library)
        save("Oatmeal", "Carbs", "1 cup", "150", "5g", "27g", "3g", "");
        save("Brown Rice", "Carbs", "1 cup", "215", "5g", "45g", "1.5g", "");
        save("Grilled Chicken Breast", "Protein", "150g", "250", "30g", "0g", "5g", "");
        save("Boiled Eggs", "Protein", "2 pcs", "140", "12g", "1g", "10g", "Whole eggs");
        save("Salmon", "Protein", "150g", "280", "25g", "0g", "15g", "");
        save("Greek Yogurt", "Dairy", "150g", "120", "10g", "6g", "4g", "");
        save("Apple", "Fruits", "1 medium", "95", "0g", "25g", "0g", "");
        save("Banana", "Fruits", "1 medium", "105", "1g", "27g", "0g", "");
        save("Steamed Vegetables", "Vegetables", "1 cup", "50", "3g", "10g", "0g", "");
        save("Broccoli", "Vegetables", "1 cup", "55", "4g", "11g", "0g", "");
        save("Olive Oil", "Fats", "1 tbsp", "120", "0g", "0g", "14g", "");
        save("Almonds", "Snacks", "30g", "170", "6g", "6g", "15g", "");
    }

    private void save(String name, String category, String qty, String cal,
                      String protein, String carbs, String fat, String note) {
        FoodLibrary f = new FoodLibrary();
        f.setName(name);
        f.setCategory(category);
        f.setDefaultQuantity(qty);
        f.setDefaultCalories(cal);
        f.setDefaultProtein(protein);
        f.setDefaultCarbs(carbs);
        f.setDefaultFat(fat);
        f.setDefaultNote(note);
        f.setActive(true);
        repo.save(f);
    }
}
