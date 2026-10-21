package com.hallado.backend.config;

import com.hallado.backend.model.*;
import com.hallado.backend.repository.PublicationRepository;
import com.hallado.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PublicationRepository publicationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PublicationRepository publicationRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.publicationRepository = publicationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (publicationRepository.count() == 0) {
            // Ensure default user exists
            User demoUser = userRepository.findByEmail("demo@hallado.com").orElseGet(() -> {
                User u = new User();
                u.setNombre("Carlos Rodríguez");
                u.setEmail("demo@hallado.com");
                u.setPassword(passwordEncoder.encode("12345678"));
                u.setEmailVerified(true);
                u.setBarrio("Palermo");
                u.setTelefono("1198765432");
                u.setDevolucionesConcretadas(5); // Insignia "Vecino Solidario"
                u.setValoracionesPositivas(12);
                u.setValoracionesNegativas(0);
                return userRepository.save(u);
            });

            User user2 = userRepository.findByEmail("maria@hallado.com").orElseGet(() -> {
                User u = new User();
                u.setNombre("María López");
                u.setEmail("maria@hallado.com");
                u.setPassword(passwordEncoder.encode("12345678"));
                u.setEmailVerified(true);
                u.setBarrio("Recoleta");
                u.setTelefono("1144556677");
                u.setDevolucionesConcretadas(2);
                u.setValoracionesPositivas(4);
                return userRepository.save(u);
            });

            // 1. Found Pets
            Publication p1 = new Publication(
                    "Mascota encontrada: Caniche Blanco con pretal rojo",
                    "Encontré un caniche blanco muy manso dando vueltas cerca de la plaza Guadalupe.",
                    PublicationType.FOUND,
                    CategoryEnum.PETS,
                    "Palermo",
                    "Av. Medrano y Charcas",
                    -34.5889, -58.4145,
                    LocalDateTime.now().minusHours(4),
                    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
                    demoUser
            );
            p1.setVerificationQuestion("¿Qué color tiene la medallita del pretal?");
            p1.setVerificationAnswer("Es plateada con forma de huesito");

            // 2. Found Keys
            Publication p2 = new Publication(
                    "Juego de llaves con llavero de River Plate",
                    "Aparecieron en el banco de la parada del colectivo 152.",
                    PublicationType.FOUND,
                    CategoryEnum.KEYS,
                    "Recoleta",
                    "Av. Santa Fe y Larrea",
                    -34.5950, -58.3980,
                    LocalDateTime.now().minusDays(1),
                    "https://images.unsplash.com/photo-1582139329536-e7284fece509",
                    user2
            );

            // 3. Lost Documents
            Publication p3 = new Publication(
                    "DNI a nombre de Juan Pérez y tarjeta de débito",
                    "Perdí mi billetera con DNI en la zona del Alto Palermo.",
                    PublicationType.LOST,
                    CategoryEnum.DOCUMENTS,
                    "Palermo",
                    "Av. Coronel Díaz 2100",
                    -34.5875, -58.4110,
                    LocalDateTime.now().minusDays(2),
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
                    demoUser
            );

            // 4. Found Backpack (Electronics)
            Publication p4 = new Publication(
                    "Mochila negra marca Nike con cargador y auriculares",
                    "Hallada cerca del Parque Centenario. Se entrega respondiendo la verificación.",
                    PublicationType.FOUND,
                    CategoryEnum.ELECTRONICS,
                    "Caballito",
                    "Av. Diaz Vélez y Campichuelo",
                    -34.6065, -58.4350,
                    LocalDateTime.now().minusDays(3),
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
                    user2
            );

            // 5. Lost Cat (Pets)
            Publication p5 = new Publication(
                    "Gato Siamés buscando a su familia - Se llama Félix",
                    "Se escapó Félix de un departamento en Belgrano C. Ojos azules, miedoso.",
                    PublicationType.LOST,
                    CategoryEnum.PETS,
                    "Belgrano",
                    "Juramento y Cabildo",
                    -34.5620, -58.4560,
                    LocalDateTime.now().minusDays(5),
                    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
                    demoUser
            );

            // 6. Found Jacket (Clothing)
            Publication p6 = new Publication(
                    "Campera de abrigo azul talle M",
                    "Olvidada en una cafetería sobre Av. Corrientes.",
                    PublicationType.FOUND,
                    CategoryEnum.CLOTHING,
                    "Almagro",
                    "Av. Corrientes 3900",
                    -34.6040, -58.4180,
                    LocalDateTime.now().minusWeeks(1),
                    "https://images.unsplash.com/photo-1544441893-675973e31985",
                    user2
            );

            publicationRepository.save(p1);
            publicationRepository.save(p2);
            publicationRepository.save(p3);
            publicationRepository.save(p4);
            publicationRepository.save(p5);
            publicationRepository.save(p6);
        }
    }
}
