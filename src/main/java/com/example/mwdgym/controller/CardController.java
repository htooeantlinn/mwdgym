package com.example.mwdgym.controller;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.oned.Code128Writer;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CardController {

    @GetMapping("/card/qr/{code}")
    public ResponseEntity<byte[]> qr(@PathVariable String code) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.MARGIN, 2);
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(code.toUpperCase(), BarcodeFormat.QR_CODE, 320, 320, hints);
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("QR generation failed", e);
        }
    }

    @GetMapping("/card/barcode/{code}")
    public ResponseEntity<byte[]> barcode(@PathVariable String code) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.MARGIN, 4);
            Code128Writer writer = new Code128Writer();
            BitMatrix matrix = writer.encode(code.toUpperCase(), BarcodeFormat.CODE_128, 480, 120, hints);
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Barcode generation failed", e);
        }
    }
}