package org.odoo.backend.common.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
@ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
public class RedisCacheConfig {

    @Value("${cache.ttl.default:60}")
    private long defaultTtlMinutes;

    @Value("${cache.ttl.short:5}")
    private long shortTtlMinutes;

    @Value("${cache.ttl.long:1440}") // 24 hours
    private long longTtlMinutes;

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = buildCacheConfig(Duration.ofMinutes(defaultTtlMinutes));

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();

        // Short-lived caches (e.g. OTP, sessions)
        cacheConfigs.put("shortLived", buildCacheConfig(Duration.ofMinutes(shortTtlMinutes)));

        // Long-lived caches (e.g. static master data)
        cacheConfigs.put("longLived", buildCacheConfig(Duration.ofMinutes(longTtlMinutes)));

        // Domain-specific caches
        cacheConfigs.put("users", buildCacheConfig(Duration.ofMinutes(30)));
        cacheConfigs.put("products", buildCacheConfig(Duration.ofMinutes(60)));
        cacheConfigs.put("orders", buildCacheConfig(Duration.ofMinutes(15)));
        cacheConfigs.put("inventory", buildCacheConfig(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware() // participates in Spring @Transactional
                .build();
    }

    private RedisCacheConfiguration buildCacheConfig(Duration ttl) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new GenericJackson2JsonRedisSerializer(objectMapper()))
                );
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Support for Java 8 date/time types (LocalDate, LocalDateTime, etc.)
        mapper.registerModule(new JavaTimeModule());

        // Embed type info so Redis can deserialize polymorphic types correctly
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        return mapper;
    }
}