package com.hallado.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Habilita las tareas programadas (@Scheduled).
 * Sin esta configuración Spring ignora los métodos @Scheduled, por ejemplo
 * el vencimiento automático de reclamos a las 48 horas (ClaimSchedulerService).
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
