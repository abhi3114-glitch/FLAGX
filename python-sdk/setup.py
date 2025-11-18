from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="feature-flag-client",
    version="1.0.0",
    author="Your Organization",
    author_email="support@example.com",
    description="Python SDK for Feature Flag Management System",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/feature-flag-system",
    packages=find_packages(exclude=["tests", "tests.*"]),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.3",
            "pytest-asyncio>=0.21.1",
            "pytest-cov>=4.1.0",
            "black>=23.12.1",
            "flake8>=6.1.0",
            "mypy>=1.7.1",
        ],
        "grpc": [
            "grpcio>=1.59.3",
            "grpcio-tools>=1.59.3",
        ],
        "async": [
            "aiohttp>=3.9.1",
            "asyncio>=3.4.3",
        ],
    },
    entry_points={
        "console_scripts": [
            "feature-flag-cli=feature_flag_client.cli:main",
        ],
    },
)