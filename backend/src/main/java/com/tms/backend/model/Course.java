package com.tms.backend.model;
import jakarta.persistence.Index;
import com.tms.backend.enums.CourseMode;
import com.tms.backend.enums.CourseType;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "course",
        indexes = {
                @Index(name = "idx_course_type", columnList = "type"),
                @Index(name = "idx_course_mode", columnList = "mode"),
                @Index(name = "idx_course_is_delete", columnList = "is_delete")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 140)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CourseType type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_hours")
    private Integer durationHours;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CourseMode mode;

    @Column(length = 200)
    private String prerequisites;

    @Column(name = "certificate_template_id", length = 80)
    private String certificateTemplateId;
    
    @Column(name = "is_delete", nullable = false)
    @Builder.Default
    private boolean isDelete = false;

    @OneToMany(mappedBy = "course", orphanRemoval = false, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Enrollment> enrollments = new ArrayList<>();

    @OneToMany(mappedBy = "course", orphanRemoval = false, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Session> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "course", orphanRemoval = false, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "course", orphanRemoval = false, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Certificate> certificates = new ArrayList<>();

  

}
