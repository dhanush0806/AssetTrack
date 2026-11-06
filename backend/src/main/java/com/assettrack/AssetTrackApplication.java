package com.assettrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AssetTrackApplication {
    public static void main(String[] args) {
        SpringApplication.run(AssetTrackApplication.class, args);
    }
}
