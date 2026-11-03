package com.hallado.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hallado.backend.dto.CreatePublicationRequest;
import com.hallado.backend.model.*;
import com.hallado.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop"})
@Import({PublicationService.class, UserLookupService.class, FileStorageService.class, IdempotentPublicationService.class, IdempotentPublicationServiceTest.JsonConfig.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class IdempotentPublicationServiceTest {
    @TestConfiguration static class JsonConfig {
        @Bean ObjectMapper objectMapper() { return JsonMapper.builder().addModule(new JavaTimeModule()).build(); }
    }
    @Autowired IdempotentPublicationService service;
    @Autowired UserRepository users;

    String account() {
        String email = UUID.randomUUID() + "@example.com";
        users.saveAndFlush(new User("Test", email, "test-hash"));
        return email;
    }
    CreatePublicationRequest request() {
        var request = new CreatePublicationRequest();
        request.setTitle("Llaves perdidas"); request.setType(PublicationType.LOST);
        request.setCategory(CategoryEnum.KEYS); request.setBarrio("Palermo");
        return request;
    }
    @Test void retryReturnsOriginalPublicationAndRejectsDifferentPayload() throws Exception {
        String email = account(); var request = request();
        var first = service.create(request, null, email, "stable");
        var replay = service.create(request, null, email, "stable");
        assertEquals(first.getId(), replay.getId());
        assertEquals(first.getPublisher().getEmail(), replay.getPublisher().getEmail());
        request.setTitle("Otra publicación");
        assertThrows(ResponseStatusException.class, () -> service.create(request, null, email, "stable"));
    }
    @Test void validationFailureDoesNotConsumeKey() throws Exception {
        String email = account(); var request = request(); request.setTitle("");
        assertThrows(IllegalArgumentException.class, () -> service.create(request, null, email, "retry"));
        request.setTitle("Llaves perdidas");
        assertNotNull(service.create(request, null, email, "retry").getId());
    }
    @Test void concurrentRequestsCommitOnePublication() throws Exception {
        String email = account();
        var pool = Executors.newFixedThreadPool(2);
        var start = new CountDownLatch(1);
        Callable<Long> action = () -> { start.await(); return service.create(request(), null, email, "parallel").getId(); };
        try {
            var first = pool.submit(action); var second = pool.submit(action); start.countDown();
            assertEquals(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS));
        } finally { pool.shutdownNow(); }
    }
    @Test void sameKeyBelongsToDifferentAccountsIndependently() throws Exception {
        assertNotEquals(service.create(request(), null, account(), "same").getId(),
                service.create(request(), null, account(), "same").getId());
    }
}
