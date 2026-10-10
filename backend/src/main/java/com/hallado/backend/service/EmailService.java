package com.hallado.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarOtp(String destinatario, String codigo) {
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setTo(destinatario);
            mensaje.setSubject("Hallado - Tu código de verificación");
            mensaje.setText(
                    "¡Hola!\n\n"
                    + "Tu código de verificación para Hallado es:\n\n"
                    + "    " + codigo + "\n\n"
                    + "Este código expira en 5 minutos.\n"
                    + "Si no solicitaste este código, ignorá este mensaje.\n\n"
                    + "— Equipo Hallado"
            );

            mailSender.send(mensaje);
            log.info("Email OTP enviado exitosamente a {}", destinatario);

        } catch (Exception e) {
            log.error("Error al enviar email OTP a {}: {}", destinatario, e.getMessage());
        }
    }
}
