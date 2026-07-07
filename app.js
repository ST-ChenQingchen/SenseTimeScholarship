(() => {
  "use strict";

  const students = [...(window.STUDENTS || [])].sort((a, b) =>
    a.pinyin.localeCompare(b.pinyin, "en", { sensitivity: "base" })
  );

  const grid = document.querySelector("#student-grid");
  const searchInput = document.querySelector("#search-input");
  const filterGroup = document.querySelector("#filter-group");
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const resultCount = document.querySelector("#result-count");
  const emptyState = document.querySelector("#empty-state");
  const resetButton = document.querySelector("#reset-filter");
  const dialog = document.querySelector("#student-dialog");
  const closeButton = document.querySelector("#dialog-close");
  const portraitStyle = document.querySelector("#portrait-style");
  const portraitStyleButtons = [...document.querySelectorAll(".portrait-style-button")];

  let activeCategory = "全部";
  let activePortraitStyle = "anime";
  let lastFocusedElement = null;

  const portraitPath = (student) => {
    if (activePortraitStyle === "original") return student.photo;
    return student.photo.replace("./assets/students/", `./assets/students-${activePortraitStyle}/`);
  };

  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase("zh-CN")
      .replace(/[\s，、/（）()·.\-_]+/g, "");

  const searchableText = (student) =>
    normalize(
      [
        student.id,
        student.name,
        student.pinyin,
        student.school,
        student.college,
        student.bio,
        student.fields.join(" "),
        student.categories.join(" ")
      ].join(" ")
    );

  const openStudent = (student, trigger) => {
    lastFocusedElement = trigger || document.activeElement;
    document.querySelector("#dialog-photo").src = portraitPath(student);
    document.querySelector("#dialog-photo").alt = `${student.name}的证件照`;
    document.querySelector("#dialog-id").textContent = student.id;
    document.querySelector("#dialog-school").textContent = student.school;
    document.querySelector("#dialog-name").textContent = student.name;
    document.querySelector("#dialog-college").textContent = `${student.college} · ${student.grade}级`;
    document.querySelector("#dialog-bio").textContent = student.bio;

    const fields = document.querySelector("#dialog-fields");
    fields.replaceChildren(
      ...student.fields.map((field) => {
        const tag = document.createElement("span");
        tag.textContent = field;
        return tag;
      })
    );

    const links = document.querySelector("#dialog-links");
    links.replaceChildren(
      ...student.links.map((item) => {
        const link = document.createElement("a");
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.innerHTML = `<span>${item.label}</span><span aria-hidden="true">↗</span>`;
        return link;
      })
    );

    document.body.classList.add("dialog-open");
    dialog.showModal();
    closeButton.focus();
  };

  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };

  const createCard = (student) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "student-card student-entry";
    card.setAttribute("aria-label", `查看${student.name}的详细资料`);

    const photoWrap = document.createElement("span");
    photoWrap.className = "card-photo";
    const photo = document.createElement("img");
    photo.src = portraitPath(student);
    photo.alt = `${student.name}的证件照`;
    photo.loading = "lazy";
    photo.width = 295;
    photo.height = 413;
    const id = document.createElement("span");
    id.className = "card-id";
    id.textContent = student.id;
    photoWrap.append(photo, id);

    const content = document.createElement("span");
    content.className = "card-content";
    const school = document.createElement("span");
    school.className = "card-school";
    school.textContent = student.school;
    const titleRow = document.createElement("span");
    titleRow.className = "card-title-row";
    const name = document.createElement("span");
    name.className = "card-name";
    name.textContent = student.name;
    const arrow = document.createElement("span");
    arrow.className = "card-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    titleRow.append(name, arrow);
    const field = document.createElement("span");
    field.className = "card-field";
    field.textContent = student.fields.join(" · ");
    const college = document.createElement("span");
    college.className = "card-college";
    college.textContent = `${student.college} · ${student.grade}级`;
    content.append(school, titleRow, college, field);

    const biography = document.createElement("span");
    biography.className = "card-bio";
    biography.textContent = student.bio;

    card.append(photoWrap, content, biography);
    card.addEventListener("click", () => openStudent(student, card));
    return card;
  };

  const render = () => {
    const query = normalize(searchInput.value);
    const visible = students.filter((student) => {
      const categoryMatches =
        activeCategory === "全部" || student.categories.includes(activeCategory);
      const queryMatches = !query || searchableText(student).includes(query);
      return categoryMatches && queryMatches;
    });

    const fragment = document.createDocumentFragment();
    visible.forEach((student) => fragment.append(createCard(student)));
    grid.replaceChildren(fragment);
    resultCount.textContent = String(visible.length);
    emptyState.hidden = visible.length !== 0;
  };

  const setCategory = (category) => {
    activeCategory = category;
    filterButtons.forEach((button) => {
      const isActive = button.dataset.category === category;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    render();
  };

  const updateMetrics = () => {
    const schoolCount = new Set(students.map((student) => student.school)).size;
    const fieldCount = new Set(students.flatMap((student) => student.fields)).size;
    document.querySelector("#hero-student-count").textContent = String(students.length);
    document.querySelector("#metric-students").textContent = String(students.length);
    document.querySelector("#metric-schools").textContent = String(schoolCount);
    document.querySelector("#metric-fields").textContent = String(fieldCount);
  };

  searchInput.addEventListener("input", render);

  filterGroup.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-button");
    if (button) setCategory(button.dataset.category);
  });

  portraitStyle.addEventListener("click", (event) => {
    const button = event.target.closest(".portrait-style-button");
    if (!button) return;
    activePortraitStyle = button.dataset.style;
    portraitStyleButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    render();
  });

  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    setCategory("全部");
    searchInput.focus();
  });

  closeButton.addEventListener("click", closeDialog);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  });

  updateMetrics();
  render();
})();
