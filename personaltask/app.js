const groupDisplay = {
    chinese: "Chinese students",
    international: "International students"
};

const regionGroupKey = {
    "Chinese students": "chinese",
    "International students": "international"
};

const schoolGroupKey = {
    "中国学生": "chinese",
    "国际学生": "international"
};

const regionDisplay = {
    "国内高等院校": "China and Hong Kong SAR",
    "亚洲其他高等院校": "Other Asian destinations",
    "北美洲高等院校": "North American destinations",
    "欧洲或其他大学": "Europe and other destinations",
    "亚洲高等院校": "Asian destinations",
    "欧洲高等院校": "European destinations"
};

const schoolRegionDisplay = {
    "国内": "Domestic",
    "亚洲其他地区": "Other Asia",
    "北美洲": "North America",
    "欧洲或其他地区": "Europe and other",
    "亚洲": "Asia",
    "欧洲": "Europe"
};

const programStatusDisplay = {
    "原图未列该校专业": "Programs were not specified in the source."
};

const mappingNoteDisplay = {
    "原图标注直博": "The source marks this as direct doctoral admission.",
    "原图标识为 UCD": "The source identifies this school as UCD.",
    "原报告把澳大利亚列在欧洲或其他地区": "The source report groups Australia under Europe and other destinations.",
    "学校标识为 Erasmus University Rotterdam": "The source identifies this school as Erasmus University Rotterdam.",
    "按原报告的国内分组保留香港院校": "The source report retains Hong Kong schools in its domestic grouping.",
    "跨国项目，不能作为单个校园点位": "This transnational program cannot be represented as one campus point."
};

const countryDisplay = {
    "中国内地": "Mainland China",
    "中国香港": "Hong Kong SAR",
    "新加坡": "Singapore",
    "美国": "United States",
    "加拿大": "Canada",
    "英国": "United Kingdom",
    "德国": "Germany",
    "澳大利亚": "Australia",
    "沙特阿拉伯": "Saudi Arabia",
    "法国": "France",
    "荷兰": "Netherlands",
    "瑞士": "Switzerland",
    "奥地利": "Austria",
    "爱尔兰": "Ireland",
    "跨国项目": "Transnational program"
};

const schoolDisplay = {
    "西湖大学": "Westlake University", "香港大学": "The University of Hong Kong", "香港科技大学": "The Hong Kong University of Science and Technology", "中国科学技术大学": "University of Science and Technology of China", "香港理工大学": "The Hong Kong Polytechnic University", "新加坡国立大学": "National University of Singapore", "杜克-新加坡国立大学医学院": "Duke-NUS Medical School", "南洋理工大学": "Nanyang Technological University", "杜克大学": "Duke University", "哈佛大学": "Harvard University", "斯坦福大学": "Stanford University", "耶鲁大学": "Yale University", "芝加哥大学": "The University of Chicago", "宾夕法尼亚大学": "University of Pennsylvania", "西北大学": "Northwestern University", "约翰·霍普金斯大学": "Johns Hopkins University", "康奈尔大学": "Cornell University", "布朗大学": "Brown University", "达特茅斯学院": "Dartmouth College", "哥伦比亚大学": "Columbia University", "范德堡大学": "Vanderbilt University", "密歇根大学安娜堡分校": "University of Michigan, Ann Arbor", "卡内基梅隆大学": "Carnegie Mellon University", "埃默里大学": "Emory University", "乔治敦大学": "Georgetown University", "弗吉尼亚大学": "University of Virginia", "加利福尼亚大学伯克利分校": "University of California, Berkeley", "加利福尼亚大学戴维斯分校": "University of California, Davis", "加利福尼亚大学旧金山分校": "University of California, San Francisco", "加利福尼亚大学圣迭戈分校": "University of California, San Diego", "北卡罗来纳州立大学": "North Carolina State University", "南加利福尼亚大学": "University of Southern California", "德克萨斯大学奥斯汀分校": "The University of Texas at Austin", "德克萨斯大学达拉斯分校": "The University of Texas at Dallas", "华盛顿大学": "University of Washington", "纽约大学": "New York University", "艺术中心设计学院": "ArtCenter College of Design", "波士顿学院": "Boston College", "威斯康星大学麦迪逊分校": "University of Wisconsin-Madison", "不列颠哥伦比亚大学": "University of British Columbia", "波士顿大学": "Boston University", "罗切斯特大学": "University of Rochester", "威廉与玛丽学院": "William & Mary", "宾夕法尼亚州立大学": "Pennsylvania State University", "密歇根州立大学": "Michigan State University", "科罗拉多大学博尔德分校": "University of Colorado Boulder", "莱斯布里奇大学": "University of Lethbridge", "帝国理工学院": "Imperial College London", "伦敦大学学院": "University College London", "伦敦商学院": "London Business School", "汉堡大学": "University of Hamburg", "澳大利亚国立大学": "Australian National University", "悉尼大学": "The University of Sydney", "新南威尔士大学": "UNSW Sydney", "北京大学": "Peking University", "清华大学": "Tsinghua University", "上海交通大学": "Shanghai Jiao Tong University", "香港浸会大学": "Hong Kong Baptist University", "苏州大学": "Soochow University", "阿卜杜拉国王科技大学": "King Abdullah University of Science and Technology", "北卡罗来纳大学教堂山分校": "University of North Carolina at Chapel Hill", "南卡罗来纳大学": "University of South Carolina", "伊利诺伊大学芝加哥分校": "University of Illinois Chicago", "麦吉尔大学": "McGill University", "牛津布鲁克斯大学": "Oxford Brookes University", "剑桥大学": "University of Cambridge", "牛津大学": "University of Oxford", "伊拉斯谟世界计划": "Erasmus Mundus Programme", "巴黎萨克雷大学": "Université Paris-Saclay", "伊拉斯姆斯大学": "Erasmus University Rotterdam", "华威大学": "University of Warwick", "洛桑联邦理工学院": "EPFL", "维也纳大学": "University of Vienna", "都柏林大学": "University College Dublin", "爱尔兰皇家外科医学院": "Royal College of Surgeons in Ireland"
};

const programDisplay = {
    "物理学（博士）": "Physics (PhD)", "电子科学与技术（博士）": "Electronic Science and Technology (PhD)", "环境管理": "Environmental Management", "公共政策": "Public Policy", "计算媒体与艺术（博士）": "Computational Media and Arts (PhD)", "计算机科学与技术（博士）": "Computer Science and Technology (PhD)", "创新多媒体娱乐": "Innovative Multimedia Entertainment", "可持续医疗保健": "Sustainable Healthcare", "战略分析与创新": "Strategic Analysis and Innovation", "市场营销分析与策略": "Marketing Analytics and Strategy", "战略传播学": "Strategic Communication", "整合生物学与医学（博士）": "Integrative Biology and Medicine (PhD)", "机械与航空航天工程": "Mechanical and Aerospace Engineering", "计算机科学与工程（博士）": "Computer Science and Engineering (PhD)", "德国研究（博士）": "German Studies (PhD)", "电子与计算机工程": "Electrical and Computer Engineering", "工程管理": "Engineering Management", "流行病学与开发与创新工程": "Epidemiology and Development and Innovation Engineering", "风险工程": "Risk Engineering", "医学物理": "Medical Physics", "经济学与计算科学": "Economics and Computational Science", "量化管理：商业分析": "Quantitative Management: Business Analytics", "管理学": "Management", "全球健康": "Global Health", "人口健康科学": "Population Health Sciences", "实验与行为艺术": "Experimental and Performance Arts", "国际环境政策": "International Environmental Policy", "批判人文研究": "Critical Humanities", "流行病学": "Epidemiology", "计算生物与定量遗传学": "Computational Biology and Quantitative Genetics", "学习设计、创新与技术": "Learning Design, Innovation, and Technology", "环境健康": "Environmental Health", "教育政策分析": "Education Policy Analysis", "教育数据科学": "Education Data Science", "生物与生物医学（博士）": "Biological and Biomedical Sciences (PhD)", "计算生物学和生物医学信息学": "Computational Biology and Biomedical Informatics", "计算机科学": "Computer Science", "全球企业管理（M2M）": "Global Business Management (M2M)", "环境健康科学": "Environmental Health Sciences", "生物统计": "Biostatistics", "健康政策": "Health Policy", "社会科学": "Social Sciences", "系统工程": "Systems Engineering", "社会政策与数据分析": "Social Policy and Data Analytics", "东西语言与文明": "East Asian Languages and Civilizations", "应用数学与计算科学": "Applied Mathematics and Computational Science", "跨学科人类发展研究": "Interdisciplinary Human Development", "行为与决策科学": "Behavioral and Decision Sciences", "公共卫生": "Public Health", "计算机工程": "Computer Engineering", "整合市场营销传播": "Integrated Marketing Communications", "全球疾病流行病学与控制": "Global Disease Epidemiology and Control", "医学院": "School of Medicine", "材料科学与工程": "Materials Science and Engineering", "国际关系": "International Relations", "传播学": "Communication", "信息系统连接媒体方向双硕士": "Information Systems and Connected Media Dual Master's", "应用经济学与管理-国际管理双学位": "Applied Economics and Management - International Management Dual Degree", "金融工程": "Financial Engineering", "公共卫生（传染病流行病学）": "Public Health (Infectious Disease Epidemiology)", "应用经济学与管理学": "Applied Economics and Management", "生物统计与数据科学": "Biostatistics and Data Science", "健康政策与经济学": "Health Policy and Economics", "公共管理": "Public Administration", "商业分析": "Business Analytics", "信息科学": "Information Science", "环境与可持续发展": "Environment and Sustainability", "国际与区域研究（中国研究）": "International and Regional Studies (China Studies)", "计算数据科学": "Computational Data Science", "娱乐技术": "Entertainment Technology", "生物学（博士）": "Biology (PhD)", "分析学": "Analytics", "工业工程与运筹（金融科技方向）": "Industrial Engineering and Operations Research (Financial Technology)", "土木与环境工程": "Civil and Environmental Engineering", "护理科学与医疗领导力（博士）": "Nursing Science and Healthcare Leadership (PhD)", "生物医学影像": "Biomedical Imaging", "数据科学（博士）": "Data Science (PhD)", "电子工程-计算机科学（博士）": "Electrical Engineering and Computer Science (PhD)", "细胞分子生物学（博士）": "Cell and Molecular Biology (PhD)", "生物统计；信息系统管理；人本设计与工程；公共管理": "Biostatistics; Information Systems Management; Human Centered Design and Engineering; Public Administration", "交互式电信传播": "Interactive Telecommunications", "管理与分析学": "Management and Analytics", "数学": "Mathematics", "媒体、文化与传播": "Media, Culture, and Communication", "组织管理与战略": "Organizational Management and Strategy", "心理学": "Psychology", "电影": "Film", "化学（博士）": "Chemistry (PhD)", "临床康复咨询": "Clinical Rehabilitation Counseling", "数学（博士）": "Mathematics (PhD)", "数据科学": "Data Science", "视觉与文化研究（博士）": "Visual and Cultural Studies (PhD)", "生物化学、微生物学和分子生物学（博士）": "Biochemistry, Microbiology, and Molecular Biology (PhD)", "遗传和基因组科学（博士）": "Genetics and Genomic Sciences (PhD)", "转化医学": "Translational Medicine", "生物科学": "Biological Sciences", "风险管理与金融工程": "Risk Management and Financial Engineering", "战略营销": "Strategic Marketing", "哲学": "Philosophy", "金融分析": "Financial Analysis", "物理学": "Physics", "数学物理学": "Mathematical Physics", "商业管理": "Business Management", "数据科学；公共卫生": "Data Science; Public Health"
};

Object.assign(schoolDisplay, {
    "Irell & Manella Graduate School of Biological Sciences at City of Hope": "Irell & Manella Graduate School of Biological Sciences at City of Hope"
});

Object.assign(programDisplay, {
    "人本设计与工程": "Human Centered Design and Engineering", "传媒数据科学": "Media Data Science", "信息系统管理": "Information Systems Management", "公共政策与全球事务": "Public Policy and Global Affairs", "可持续管理": "Sustainable Management", "学习分析": "Learning Analytics", "市场营销": "Marketing", "市场营销科学": "Marketing Science", "数字社交媒体": "Digital Social Media", "气候学": "Climate Studies", "环境健康数据科学": "Environmental Health Data Science", "电影与媒体研究": "Film and Media Studies", "神经科学和教育": "Neuroscience and Education", "统计学": "Statistics", "计算机科学与工程": "Computer Science and Engineering", "计算机科学（博士）": "Computer Science (PhD)", "计量社会科学": "Quantitative Social Science", "金融数学": "Financial Mathematics", "金融经济": "Financial Economics"
});

const locationCentroids = {
    "中国内地": [104, 35], "中国香港": [114.17, 22.3], "新加坡": [103.8, 1.35], "美国": [-98, 39], "加拿大": [-106, 57], "英国": [-2, 54], "德国": [10.4, 51.1], "澳大利亚": [134, -25], "沙特阿拉伯": [45, 24], "法国": [2, 47], "荷兰": [5.3, 52], "瑞士": [8.2, 46.8], "奥地利": [14.5, 47.5], "爱尔兰": [-8, 53]
};

const state = { activeGroup: "chinese", selectedRegion: null, selectedLocation: null, selectedSchool: null, regions: [], schools: [], world: null };
const status = d3.select("#app-status");

function textFor(map, raw) {
    return map[raw] || "Source translation pending";
}

function programsFor(rawPrograms) {
    if (!rawPrograms) return ["Not specified in the source"];
    if (programDisplay[rawPrograms]) return programDisplay[rawPrograms].split("; ");
    return rawPrograms.split("；").map((program) => programDisplay[program] || "Source translation pending");
}

async function loadData() {
    const [regionRows, schoolRows] = await Promise.all([
        d3.csv("../data/further_study_regions_2025.csv"),
        d3.csv("../data/further_study_schools_2025.csv")
    ]);
    state.regions = regionRows.map((row) => ({ ...row, groupKey: regionGroupKey[row.student_group], displayRegion: textFor(regionDisplay, row.destination_as_report), percent: Number(row.percent_of_group_continuing_study) }));
    state.schools = schoolRows.map((row, index) => ({ ...row, id: `${row.student_group}-${index}`, groupKey: schoolGroupKey[row.student_group], count: Number(row.listed_student_count), displayRegion: textFor(schoolRegionDisplay, row.region_as_report), displayCountry: textFor(countryDisplay, row.country_or_area_for_map), displaySchool: textFor(schoolDisplay, row.school_as_report), displayPrograms: programsFor(row.programs_as_report) }));
    state.world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
}

function renderToggle() {
    const buttons = d3.select("#group-toggle").selectAll("button").data(Object.entries(groupDisplay), ([key]) => key);
    buttons.join("button").attr("type", "button").attr("aria-pressed", ([key]) => key === state.activeGroup).text(([, label]) => label).on("click", (_, [key]) => setActiveGroup(key));
}

function renderRegionFilter() {
    const regions = [...new Map(state.schools.filter((school) => school.groupKey === state.activeGroup).map((school) => [school.region_as_report, school.displayRegion])).entries()].map(([rawRegion, displayRegion]) => ({ rawRegion, displayRegion }));
    const choices = [{ rawRegion: null, displayRegion: "All reported regions" }, ...regions];
    const buttons = d3.select("#region-filter").selectAll("button").data(choices, (choice) => choice.rawRegion || "all");
    buttons.join("button").attr("type", "button").attr("aria-pressed", (choice) => choice.rawRegion === state.selectedRegion).text((choice) => choice.displayRegion).on("click", (_, choice) => setRegion(choice.rawRegion));
}

function setActiveGroup(groupKey) {
    state.activeGroup = groupKey;
    state.selectedRegion = null;
    state.selectedLocation = null;
    state.selectedSchool = null;
    renderToggle();
    renderRegionFilter();
    renderRegionChart();
    selectDefaultSchool();
    renderMap();
    renderSchoolChart();
    renderLocationDetail();
    renderSchoolDetail();
}

function setRegion(rawRegion) {
    state.selectedRegion = rawRegion;
    state.selectedLocation = null;
    state.selectedSchool = null;
    renderRegionFilter();
    selectDefaultSchool();
    renderMap();
    renderSchoolChart();
    renderLocationDetail();
    renderSchoolDetail();
}

function schoolsForActiveRegion() {
    return state.schools.filter((school) => school.groupKey === state.activeGroup && (!state.selectedRegion || school.region_as_report === state.selectedRegion));
}

function visibleSchools() {
    return schoolsForActiveRegion().filter((school) => !state.selectedLocation || school.country_or_area_for_map === state.selectedLocation);
}

function groupedSchools() {
    return d3.rollups(visibleSchools(), (rows) => ({ ...rows[0], count: d3.sum(rows, (row) => row.count), displayPrograms: [...new Set(rows.flatMap((row) => row.displayPrograms))] }), (row) => row.school_as_report).map(([, school]) => school).sort((a, b) => d3.descending(a.count, b.count) || d3.ascending(a.displaySchool, b.displaySchool));
}

function groupedLocations() {
    return d3.rollups(schoolsForActiveRegion().filter((school) => locationCentroids[school.country_or_area_for_map]), (rows) => ({ rawLocation: rows[0].country_or_area_for_map, displayLocation: rows[0].displayCountry, schoolCount: rows.length, studentCount: d3.sum(rows, (row) => row.count) }), (row) => row.country_or_area_for_map).map(([, location]) => location);
}

function showTooltip(event, lines) {
    d3.select("#tooltip").html(lines.map((line) => `<div>${line}</div>`).join("")).classed("visible", true).attr("aria-hidden", "false").style("left", `${event.clientX + 14}px`).style("top", `${event.clientY + 14}px`);
}

function hideTooltip() {
    d3.select("#tooltip").classed("visible", false).attr("aria-hidden", "true");
}

function selectLocation(location) {
    state.selectedLocation = state.selectedLocation === location ? null : location;
    state.selectedSchool = null;
    selectDefaultSchool();
    renderMap();
    renderSchoolChart();
    renderLocationDetail();
    renderSchoolDetail();
}

function renderMap() {
    const width = 650;
    const height = 370;
    const svg = d3.select("#world-map").selectAll("svg").data([null]).join("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img").attr("aria-label", `${groupDisplay[state.activeGroup]} listed school locations`);
    const projection = d3.geoNaturalEarth1().fitSize([width - 24, height - 24], { type: "Sphere" });
    const path = d3.geoPath(projection);
    const countries = topojson.feature(state.world, state.world.objects.countries).features;
    const locations = groupedLocations();
    const radius = d3.scaleSqrt().domain([0, d3.max(locations, (location) => location.studentCount) || 1]).range([7, 28]);
    svg.selectAll("*").remove();
    svg.append("path").datum({ type: "Sphere" }).attr("class", "map-sphere").attr("d", path);
    svg.append("g").selectAll("path").data(countries).join("path").attr("class", "map-country").attr("d", path);
    svg.append("g").selectAll("circle").data(locations, (location) => location.rawLocation).join("circle").attr("class", (location) => `map-bubble${state.selectedLocation === location.rawLocation ? " selected" : ""}`).attr("cx", (location) => projection(locationCentroids[location.rawLocation])[0]).attr("cy", (location) => projection(locationCentroids[location.rawLocation])[1]).attr("r", (location) => radius(location.studentCount)).attr("tabindex", 0).attr("role", "button").attr("aria-label", (location) => `${location.displayLocation}: ${location.schoolCount} listed schools and ${location.studentCount} listed students`).on("pointerenter", (event, location) => showTooltip(event, [`<strong>${location.displayLocation}</strong>`, `${location.schoolCount} listed schools`, `${location.studentCount} listed students`])).on("pointermove", (event, location) => showTooltip(event, [`<strong>${location.displayLocation}</strong>`, `${location.schoolCount} listed schools`, `${location.studentCount} listed students`])).on("pointerleave", hideTooltip).on("click", (_, location) => selectLocation(location.rawLocation)).on("keydown", (event, location) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectLocation(location.rawLocation); } });
    const transnational = schoolsForActiveRegion().filter((school) => school.country_or_area_for_map === "跨国项目");
    svg.append("text").attr("class", "map-caption").attr("x", 20).attr("y", height - 20).text(transnational.length ? `Excluded from map: ${d3.sum(transnational, (school) => school.count)} listed student in a transnational program.` : "No transnational program record in this group.");
}

function renderLocationDetail() {
    const panel = d3.select("#location-detail").html("");
    if (!state.selectedLocation) {
        const rows = schoolsForActiveRegion();
        panel.append("h4").text(state.selectedRegion ? `${textFor(schoolRegionDisplay, state.selectedRegion)} selected` : "All reported regions selected");
        panel.append("p").text(`${rows.length} school records and ${d3.sum(rows, (school) => school.count)} listed students in the partial school list.`);
        return;
    }
    const schools = groupedSchools();
    panel.append("h4").text(`${textFor(countryDisplay, state.selectedLocation)} selected`);
    panel.append("p").text(`${schools.length} schools, ${d3.sum(schools, (school) => school.count)} listed students in the partial school list.`);
    const list = panel.append("div").attr("class", "school-chip-list");
    list.selectAll("button").data(schools).join("button").attr("type", "button").attr("class", (school) => state.selectedSchool === school.school_as_report ? "school-chip-selected" : null).attr("aria-pressed", (school) => state.selectedSchool === school.school_as_report).text((school) => school.displaySchool).on("click", (_, school) => selectSchool(school.school_as_report));
}

function selectSchool(rawSchool) {
    state.selectedSchool = rawSchool;
    renderLocationDetail();
    renderSchoolChart();
    renderSchoolDetail();
}

function selectDefaultSchool() {
    const firstSchool = groupedSchools()[0];
    state.selectedSchool = firstSchool ? firstSchool.school_as_report : null;
}

function renderSchoolChart() {
    const rows = groupedSchools();
    const width = 700;
    const margin = { top: 22, right: 46, bottom: 30, left: 260 };
    const height = Math.max(250, rows.length * 31 + margin.top + margin.bottom);
    const svg = d3.select("#school-chart").selectAll("svg").data([null]).join("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img").attr("aria-label", `${groupDisplay[state.activeGroup]} listed students by school`);
    const x = d3.scaleLinear().domain([0, d3.max(rows, (row) => row.count) || 1]).nice().range([margin.left, width - margin.right]);
    const y = d3.scaleBand().domain(rows.map((row) => row.school_as_report)).range([margin.top, height - margin.bottom]).padding(0.22);
    svg.selectAll("*").remove();
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d"))).call((axis) => axis.select(".domain").attr("stroke", "#9aa5a0"));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).tickSize(0).tickFormat((rawSchool) => schoolDisplay[rawSchool] || "Source translation pending")).call((axis) => axis.select(".domain").remove()).selectAll("text").attr("font-size", 11);
    svg.append("g").selectAll("rect").data(rows).join("rect").attr("class", (school) => `school-bar${state.selectedSchool === school.school_as_report ? " selected" : ""}`).attr("x", margin.left).attr("y", (school) => y(school.school_as_report)).attr("height", y.bandwidth()).attr("width", (school) => x(school.count) - margin.left).attr("rx", 4).attr("tabindex", 0).attr("role", "button").attr("aria-label", (school) => `${school.displaySchool}, ${school.count} listed students`).on("pointerenter", (event, school) => showTooltip(event, [`<strong>${school.displaySchool}</strong>`, `${school.count} listed students`])).on("pointermove", (event, school) => showTooltip(event, [`<strong>${school.displaySchool}</strong>`, `${school.count} listed students`])).on("pointerleave", hideTooltip).on("click", (_, school) => selectSchool(school.school_as_report)).on("keydown", (event, school) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectSchool(school.school_as_report); } });
    svg.append("g").selectAll("text.value").data(rows).join("text").attr("x", (school) => x(school.count) + 8).attr("y", (school) => y(school.school_as_report) + y.bandwidth() / 2 + 4).attr("font-size", 12).attr("font-weight", 700).text((school) => school.count);
}

function renderSchoolDetail() {
    const panel = d3.select("#school-detail").html("");
    if (!state.selectedSchool) return;
    const school = groupedSchools().find((row) => row.school_as_report === state.selectedSchool) || visibleSchools().find((row) => row.school_as_report === state.selectedSchool);
    if (!school) return;
    panel.append("h3").text(`${school.displaySchool} · ${school.displayCountry} · ${school.displayRegion}`);
    panel.append("p").text(`${school.count} listed ${school.count === 1 ? "student" : "students"} in the partial school list.`);
    panel.append("h4").text("Programs listed in the source");
    panel.append("ul").selectAll("li").data(school.displayPrograms).join("li").text((program) => program);
    const programStatus = programStatusDisplay[school.programs_transcription_status];
    const metadata = programStatus ? [["Programs transcription status", programStatus]] : [];
    if (school.mapping_note) metadata.push(["Source note", textFor(mappingNoteDisplay, school.mapping_note)]);
    if (metadata.length) {
        const sourceList = panel.append("dl").attr("class", "source-metadata");
        sourceList.selectAll("dt").data(metadata).join("dt").text(([label]) => label);
        sourceList.selectAll("dd").data(metadata).join("dd").text(([, value]) => value);
    }
}

function renderRegionChart() {
    const rows = state.regions.filter((row) => row.groupKey === state.activeGroup);
    const width = 1040;
    const rowHeight = 66;
    const height = rows.length * rowHeight + 54;
    const margin = { top: 20, right: 82, bottom: 24, left: 230 };
    const svg = d3.select("#region-chart").selectAll("svg").data([null]).join("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img").attr("aria-label", `${groupDisplay[state.activeGroup]} destination shares`);
    const x = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
    const y = d3.scaleBand().domain(rows.map((row) => row.displayRegion)).range([margin.top, height - margin.bottom]).padding(0.28);
    svg.selectAll("*").remove();
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickValues([0, 25, 50, 75, 100]).tickFormat((value) => `${value}%`)).call((axis) => axis.select(".domain").attr("stroke", "#9aa5a0"));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).tickSize(0)).call((axis) => axis.select(".domain").remove());
    svg.append("g").selectAll("rect").data(rows).join("rect").attr("x", margin.left).attr("y", (row) => y(row.displayRegion)).attr("height", y.bandwidth()).attr("width", (row) => x(row.percent) - margin.left).attr("rx", 5).attr("fill", "#0f6b59");
    svg.append("g").selectAll("text.value").data(rows).join("text").attr("class", "value").attr("x", (row) => x(row.percent) + 10).attr("y", (row) => y(row.displayRegion) + y.bandwidth() / 2 + 5).attr("fill", "#17211f").attr("font-weight", 700).text((row) => `${row.percent.toFixed(1)}%`);
    d3.select("#denominator-note").text(rows[0]?.denominator_definition ? `Denominator: ${state.activeGroup === "chinese" ? "Chinese students who chose further study" : "International students who chose further study"}.` : "Percentages use students in this group who chose further study as the denominator.");
}

async function initialize() {
    try {
        await loadData();
        renderToggle();
        renderRegionFilter();
        renderRegionChart();
        selectDefaultSchool();
        renderMap();
        renderSchoolChart();
        renderLocationDetail();
        renderSchoolDetail();
        status.text("Data loaded. Select a student group to update the view.");
    } catch (error) {
        status.classed("error", true).text("The supplied CSV files could not be loaded. Start this page from a local web server and try again.");
        console.error(error);
    }
}

initialize();
